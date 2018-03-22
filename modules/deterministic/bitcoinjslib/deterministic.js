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
    // DISABLED INSIDE wrapper FUNCTION: var wrapperlib = require('bitcoinjs-lib');
    
    var functions = {         
      // create deterministic public and private keys based on a seed
      keys : function(data) {
        // return deterministic transaction data
        var network = 'bitcoin';
        if(data.mode === 'counterparty') {
          network = 'bitcoin';
        } else { network = data.mode; }

        var hash = wrapperlib.crypto.sha256(data.seed);
        var privk = BigInteger.fromBuffer(hash);
        var pubk  = null;

        if (network === 'bitcoin' || network === 'counterparty') {
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
        if(data.mode === 'counterparty') {
          network = 'bitcoin';
        } else { network = data.mode; }

        var keyPair = wrapperlib.ECPair.fromWIF(data.WIF,wrapperlib.networks[network])
        return keyPair.getAddress();
      },

      transaction : function(data) {
        // return deterministic transaction data
        var network = 'bitcoin';
        if(data.mode === 'counterparty') {
          network = 'bitcoin';
        } else { network = data.mode; }
        
        var keyPair = wrapperlib.ECPair.fromWIF(data.keys.WIF,wrapperlib.networks[network]);
        var tx = new wrapperlib.TransactionBuilder(wrapperlib.networks[network]);

        // add inputs
        for(var i in data.unspent.unspents) {
          tx.addInput(data.unspent.unspents[i].txid,parseInt(data.unspent.unspents[i].txn));
        }

        // add an op_return message
        if (data.mode === 'counterparty') {
          var payloadBuffer = Buffer.from(data.unspent.payload, 'hex');
          var payloadScript = wrapperlib.script.nullData.output.encode(payloadBuffer);
          tx.addOutput(payloadScript, 0);    // or , 1000);
        }

        // add outputs
        tx.addOutput(data.target,parseInt(data.amount));

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

    return functions;
  }
)();

// export the functionality to a pre-prepared var
deterministic = wrapper;
