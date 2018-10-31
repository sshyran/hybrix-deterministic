// (C) 2015 Internet of Coins / Metasync / Joachim de Koning
// hybridd module - electrum/deterministic_source.js
// Deterministic encryption wrapper for Bitcoin
//
// [!] Browserify this and save to deterministic.js.lzma to enable sending it from hybridd to the browser!
//
var wrapperlib = require('./wrapperlib');


var wrapper = (
  function() {

    var base58 = require('bs58');
    var ecurve = require('ecurve');
    var BigInteger = require('bigi');
    // DISABLED INSIDE wrapper FUNCTION: var wrapperlib = require('bitcoinjs-lib');

    function setNetwork(data) {
        var network = 'bitcoin';
        if(
            data.mode === 'bitcoincash'
          ) {
          return '[UNDER MAINTENANCE]';
        } else if(
            data.mode === 'counterparty' ||
            data.mode ==='omni'
          ) {
          network = 'bitcoin';
        } else {
          network = data.mode;
        }
        return network;
    }

    var functions = {
      // create deterministic public and private keys based on a seed
      keys : function(data) {
        // return deterministic transaction data
        var network = setNetwork(data);
        var hash = wrapperlib.crypto.sha256(data.seed);
        var privk = BigInteger.fromBuffer(hash);
        var pubk  = null;

        if (network === 'bitcoin') {
          var keyPair = new wrapperlib.ECPair(privk);       // backwards compatibility for BTC
        } else {
          var keyPair = new wrapperlib.ECPair(privk, pubk, {
                          compressed: false,
                          network: wrapperlib.networks[network]
                        });
        }
        var wif = keyPair.toWIF();
        return { WIF:wif };                 // returns object { WIF:'Kxr9tQED9H44gCmp6HAdmemAzU3n84H3dGkuWTKvE23JgHMW8gct' }
      },

      // generate a unique wallet address from a given public key
      address : function(data) {
        // return deterministic transaction data
        var network = setNetwork(data);
        var keyPair = wrapperlib.ECPair.fromWIF(data.WIF,wrapperlib.networks[network]);
        return keyPair.getAddress();
      },

      // return public key
      publickey : function(data) {
        var network = setNetwork(data);
        var keyPair = wrapperlib.ECPair.fromWIF(data.WIF,wrapperlib.networks[network]);
        return keyPair.getPublicKeyBuffer().toString('hex');
      },

      // return private key
      privatekey : function(data) {
        return data.WIF;
      },

      transaction : function(data) {
        // return deterministic transaction data
        var network = setNetwork(data);
        var keyPair = wrapperlib.ECPair.fromWIF(data.keys.WIF,wrapperlib.networks[network]);
        var tx = new wrapperlib.TransactionBuilder(wrapperlib.networks[network]);

        // for Counterparty or Omni, add OP_RETURN message
        if (data.mode === 'counterparty' || data.mode === 'omni') {

          if(data.mode === 'counterparty') {
            var CounterJS = require('./CounterJS');
          }
          if(data.mode === 'omni') {
            var omniSend = require('./omni-simple-send');
          }

          const MIN_REQUIRED = 546;
          const MAX_OP_RETURN = 80;

          // prepare raw transaction inputs
          var inamount=0;
          for(var i in data.unspent.unspents) {
            var input = data.unspent.unspents[i];
            var hash = Buffer.from(input.txid.match(/.{2}/g).reverse().join(''), 'hex');
            tx.addInput(hash, input.txn);
            inamount+=input.amount;
          }
          if(inamount < MIN_REQUIRED) throw new Error('Insufficient funds');

          // in case of Counterparty or Omni, add destination output
          if(data.target) {
            if(typeof data.target === 'string') {
              var dest = {
                address: data.target,
                value: MIN_REQUIRED
              };
            }
            tx.addOutput(wrapperlib.address.toOutputScript(dest.address, wrapperlib.networks[network]), dest.value);
          }

          // create and add message
          if(data.mode === 'counterparty') {
            // create Send
            var scripthex = CounterJS.Message.createSend(
              CounterJS.util.assetNameToId(data.contract),
              parseInt(data.amount)
            );
            // encrypt/encode
            var encoded = scripthex.toEncrypted(data.unspent.unspents[0].txid, true);
          }
          if(data.mode === 'omni') {
            // create encoded Send
            var encoded = omniSend(parseInt(data.contract), parseInt(data.amount));
          }

          // add OP_RETURN
          for(var bytesWrote=0; bytesWrote<encoded.length; bytesWrote+=MAX_OP_RETURN) {
            tx.addOutput(wrapperlib.script.nullData.output.encode(encoded.slice(bytesWrote, bytesWrote+MAX_OP_RETURN)), 0);
          }

          // send back change
          var outchange=parseInt(data.unspent.change)-MIN_REQUIRED;   // fee is already being deducted when calculating unspents
          if(outchange<0) { outchange=0; }
          tx.addOutput(wrapperlib.address.toOutputScript(data.source, wrapperlib.networks[network]), outchange);

        } else {

          // add inputs
          for(var i in data.unspent.unspents) {
            tx.addInput(data.unspent.unspents[i].txid,parseInt(data.unspent.unspents[i].txn));
          }

          // add spend amount output
          tx.addOutput(data.target,parseInt(data.amount));

          // send back change
          var outchange=parseInt(data.unspent.change);   // fee is already being deducted when calculating unspents
          if(outchange>0) { tx.addOutput(data.source,outchange); }

        }


        // sign inputs
        for(var i in data.unspent.unspents) {
          tx.sign(parseInt(i),keyPair);
        }

        return tx.build().toHex();

      }
    }

    return functions;
  }
)();

// export the functionality to a pre-prepared var
window.deterministic = wrapper;
