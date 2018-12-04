// (C) 2015 Internet of Coins / Metasync / Joachim de Koning
// hybrixd module - electrum/deterministic_source.js
// Deterministic encryption wrapper for Bitcoin
//
// [!] Browserify this and save to deterministic.js.lzma to enable sending it from hybrixd to the browser!
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

        if(typeof data.unspent.unsignedtx==='string') {
          // reconstruct transaction from unsigned hex string
          var txunsigned = wrapperlib.Transaction.fromHex(data.unspent.unsignedtx);

          // validate the output address to make sure unsigned
          // transaction has not been mutated during transit
          var address = [];
          for(var i=0;i<txunsigned.outs.length;i++) {
            try {
              address = wrapperlib.address.fromOutputScript(txunsigned.outs[i].script);
            } catch (e) {}
          }
          if (address!==data.source) {
            throw 'Error: Target is mangled. Transaction cancelled for security!'
          }

          var tx = wrapperlib.TransactionBuilder.fromTransaction(txunsigned);
          // DEBUG: console.log(JSON.stringify(tx));
          
        } else {
          // create new transaction
          var tx = new wrapperlib.TransactionBuilder(wrapperlib.networks[network]);
          // add inputs
          for(var i in data.unspent.unspents) {
            tx.addInput(data.unspent.unspents[i].txid,parseInt(data.unspent.unspents[i].txn));
          }
        }

        // add an op_return message
        if (data.mode === 'counterparty') {

          // Instead of building the Counterparty transaction, we will generate it
          // on a Counterparty server, and verify and sign it here.
          // Would we rather do it all here? Yes.
          // So if someone has the time to do it we'd love you for it!


          /*
          // in case of Counterparty, add destination output with spend fee, instead of amount
          tx.addOutput(data.target,parseInt(data.fee));
          */
          
          /* JOACHIM'S FAILED METHOD
          var CounterJS = require('./CounterJS');
          var payload = CounterJS.Message.createSend(data.contract, parseInt(data.amount));
          console.log('PAYLOAD: '+JSON.stringify(payload));

          // add message
          var encrypted = payload.toEncrypted(data.unspent.unspents[0].txid, 0);
          var MAX_OP_RETURN = 80;
          for(var bytesWrote=0; bytesWrote<encrypted.length; bytesWrote+=MAX_OP_RETURN) {
            tx.addOutput(wrapperlib.script.nullData.output.encode(encrypted.slice(bytesWrote, bytesWrote+MAX_OP_RETURN)), 0);
          } */

          /* ROUKE'S FAILED METHOD
          var payload_old = create_xcp_send_data_opreturn(data.contract.toUpperCase(),parseInt(data.amount));
          var payloadBuffer = Buffer.from(payload_old, 'hex');
          var payloadScript = wrapperlib.script.nullData.output.encode(payloadBuffer);

          //tx.addOutput(payload, 0);
          
          //
          console.log('OLD: '+payload_old);
          console.log('NEW: '+payloadScript);
          //
          */


        } else {

          // add spend amount output
          tx.addOutput(data.target,parseInt(data.amount));
          /* TODO: add support for Bitcoin Cash
           *if(data.mode === 'bitcoincash') {
            tx.enableBitcoinCash(true);
            tx.setVersion(2);
          }*/

        }

        if(typeof data.unspent.unsignedtx!=='string') {
          
          // send back change
          var outchange=parseInt(data.unspent.change); // fee is already being deducted when calculating unspents
          if(outchange>0) { tx.addOutput(data.source,outchange); }
          // sign inputs
          //console.log(JSON.stringify(tx));
          for(var i in data.unspent.unspents) {
            tx.sign(i,keyPair);
          }
          
          return tx.build().toHex();
          
        } else {
          
          // sign rawtransaction inputs - get the txid of the input
          console.log(JSON.stringify(tx));
          for(var i in data.unspent.unspents) {
            tx.sign(i, keyPair);
            var rawSignedTransaction;
            try {
                rawSignedTransaction = tx.build().toHex();
            } catch (e) {
                if ('Transaction is missing signatures' === e.message) {
                    // normal, because not all inputs are signed yet.
                    rawSignedTransaction = tx.buildIncomplete().toHex();
                } else if ('Not enough signatures provided' === e.message) {
                    rawSignedTransaction = tx.buildIncomplete().toHex();
                } else {
                    console.log(e);
                }
            }
          }
          return rawSignedTransaction;
          
        }
      }
    }

    return functions;
  }
)();

// export the functionality to a pre-prepared var
deterministic = wrapper;


    function parseLargeIntToRawHex(input) {
      var result = wrapperlib.hex2dec.toHex( new Decimal(String(input)).toInteger().toFixed(64).replace(/\.?0+$/,"") );
      return result !== null ? result.substr(2,result.length-2) : '0';
    }

