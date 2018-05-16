// (C) 2015 Internet of Coins / Metasync / Joachim de Koning
// hybridd module - electrum/deterministic_source.js
// Deterministic encryption wrapper for Bitcoin
//
// [!] Browserify this and save to deterministic.js.lzma to enable sending it from hybridd to the browser!
//

var wrapper = (
  function() {
    var base58 = require('bs58');
    var ecurve = require('ecurve');
    var BigInteger = require('bigi');

    var functions = {
      // create deterministic public and private keys based on a seed
      keys : function(data) {
        // return deterministic transaction data
        var network = 'bitcoin';
        if(
            data.mode === 'counterparty' ||
            data.mode === 'bitcoincash'  ||
            data.mode ==='omni'
          ) {
          network = 'bitcoin';
        } else {
          network = data.mode;
        }

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
        var network = 'bitcoin';
        if(
            data.mode === 'bitcoincash'  ||
            data.mode ==='omni'
          ) {
          return '[UNDER MAINTENANCE]';
        } else if(
            data.mode === 'counterparty'
          ) {
          network = 'bitcoin';
        } else {
          network = data.mode;
        }

        var keyPair = wrapperlib.ECPair.fromWIF(data.WIF,wrapperlib.networks[network])
        return keyPair.getAddress();
      },

      transaction : function(data) {
        // return deterministic transaction data
        var network = 'bitcoin';
        if(
            data.mode === 'bitcoincash'  ||
            data.mode === 'omni'
          ) {
          return '[UNDER MAINTENANCE]';
        } else if(
            data.mode === 'counterparty'
          ) {
          network = 'bitcoin';
        } else {
          network = data.mode;
        }
        
        var keyPair = wrapperlib.ECPair.fromWIF(data.keys.WIF,wrapperlib.networks[network]);
        
        
        if (data.mode === 'counterparty') {

          var tx = new wrapperlib.TransactionBuilder(wrapperlib.networks[network]);

          // add inputs
          for(var i in data.unspent.unspents) {
            tx.addInput(data.unspent.unspents[i].txid,parseInt(data.unspent.unspents[i].txn));
          }

          // in case of Counterparty, add destination
          /* EXPENSIVE TO TRY THIS OUT!!!
          if(data.target) {
            if(typeof data.target === 'string') {
              var dest = {
                address: data.target,
                value: 0,               // we send zero just to specify target
              };
            }
            tx.addOutput(wrapperlib.address.toOutputScript(dest.address, wrapperlib.networks[network]), dest.value);
          }
          */
          var scripthex = wrapperlib.counterjs.Message.createSend(
            wrapperlib.counterjs.util.assetNameToId(data.contract),
            parseInt(data.amount)
          );

          var encrypted = scripthex.toEncrypted(data.unspent.unspents[0].txid, 0);
          var MAX_OP_RETURN=80;
          for(var bytesWrote=0; bytesWrote<encrypted.length; bytesWrote+=MAX_OP_RETURN) {
            tx.addOutput(wrapperlib.script.nullData.output.encode(encrypted.slice(bytesWrote, bytesWrote+MAX_OP_RETURN)), 0);
          }          

          // DOESN'T WORK: var scripthex = wrapperlib.counterparty.createSendScriptHex(data.contract,data.amount,data.unspent.unspents[0].txid);
          //if(typeof data.unspent.unsignedtx==='string') {
          //var payloadBuffer = Buffer.from(scripthex, 'hex');
          //var payloadScript = wrapperlib.script.nullData.output.encode(payloadBuffer);
          //tx.addOutput(payloadScript,0);
          
          // send back change
          var outchange=parseInt(data.unspent.change-5430);         // fee is already being deducted when calculating unspents
          if(outchange>0) { tx.addOutput(data.source,outchange); }

          // sign inputs
          for(var i in data.unspent.unspents) {
            tx.sign(parseInt(i),keyPair);
          }

          // DEBUG: return 'contract: '+data.contract+' amnt:'+data.amount+'  '+scripthex;
          return tx.build().toHex();

          /*
          } else {
            throw 'Error: Missing unsignedtx input data!'
          }*/

        } else {

          var tx = new wrapperlib.TransactionBuilder(wrapperlib.networks[network]);

          // add inputs
          for(var i in data.unspent.unspents) {
            tx.addInput(data.unspent.unspents[i].txid,parseInt(data.unspent.unspents[i].txn));
          }

          // add spend amount output
          tx.addOutput(data.target,parseInt(data.amount));

          /* TODO: add support for Bitcoin Cash
           *if(data.mode === 'bitcoincash') {
            tx.enableBitcoinCash(true);
            tx.setVersion(2);
          }*/

          // send back change
          var outchange=parseInt(data.unspent.change); // fee is already being deducted when calculating unspents
          if(outchange>0) { tx.addOutput(data.source,outchange); }

          // sign inputs
          for(var i in data.unspent.unspents) {
            tx.sign(parseInt(i),keyPair);
          }

          return tx.build().toHex();

        }

      }
    }

    return functions;
  }
)();

// export the functionality to a pre-prepared var
deterministic = wrapper;
