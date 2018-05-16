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
    var CounterJS = require('./CounterJS');

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

          if(typeof data.unspent.unsignedtx==='string') {
            // reconstruct unsigned transaction from unsigned hex string
            var txunsigned = wrapperlib.Transaction.fromHex(data.unspent.unsignedtx);
            // validate the output address to make sure unsigned
            //  transaction has not been mutated during transit
            var address = [];
            for(var i=0;i<txunsigned.outs.length;i++) {
              try {
                address = wrapperlib.address.fromOutputScript(txunsigned.outs[i].script);
              } catch (e) {}
            }
            if (address!==data.source) {
              throw 'Error: Address mismatch! Transaction cancelled for security!'
            }
            // prepare transaction for signing
            var tx = CounterJS.TransactionBuilder.fromTransaction(txunsigned);
            
/*
OK var key = Bitcoin.ECKey.fromWIF(‘private key’);
OK var tx=Bitcoin.Transaction.fromHex(‘HEX-data from step 1’);
tx.sign(0, key);
tx.toHex(); // HEX-data of signed transation
Result: hex-data of signed transaction.
*/

            // sign inputs
            for(var i in data.unspent.unspents) {
              // this will add a bitcore input that will have the information for signing
              tx.from({
                txid: data.unspent.unspents[i].txid,
                outputIndex: data.unspent.unspents[i].txn,
                script: data.unspent.unspents[i].script,
                address: data.source, 
                satoshis: parseInt(data.unspent.unspents[i].amount*100000000)
              });            

              tx.sign(parseInt(i),keyPair);
            }
            
            return tx.build().toHex();            

          } else {
            throw 'Error: Missing unsignedtx input data!'
          }

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
