// (C) 2017 Internet of Coins / Metasync / Joachim de Koning
// hybridd module - waves/deterministic.js
// Deterministic encryption wrapper for Waves

// this to prevent waves api from connecting with waves server, we only want the signed tx, not the pushing of the signed tx.
/* DEPRECATED
window.altFetch = function(url, opts){
  return new Promise((resolve, reject) => {
    if(resolve){
      resolve({
        json : (response) => { // we don't return anything usefull with the response, just let it burn. We've got we came for and we'll capture the request with a catch
          return new Promise((resolve2, reject2) => {
            if(resolve2){
              resolve2(opts);
            }else{
              reject2({data:{body:"Waves: promise rejected."}});
            }
          });
        }
      });
    }else{
      reject({data:{body:"Waves: promise rejected."}});
    }
  });
};
*/

var wrapperlib = require('./wrapperlib');
const { transfer } = require('waves-transactions');

function uglyClone(obj){return JSON.parse(JSON.stringify(obj));}

var wrapper = (
  function() {

    var Waves = wrapperlib.create(wrapperlib.MAINNET_CONFIG);

    var functions = {

      // create deterministic public and private keys based on a seed
      keys: function(data) {
        return uglyClone(Waves.Seed.fromExistingPhrase(data.seed));
      },

      // return public address
      address: function(data) {
        return uglyClone(data.address);
      },

      // return public key TODO
      publickey : function(data) {
        return uglyClone(data.keyPair.publicKey);
      },

      // return private key TODO
      privatekey : function(data) {
        return uglyClone(data.keyPair.privateKey);
      },

      transaction: function(data,callback) {

        var seed = data.seed;
        var txParams;
        
        if (data.mode !== 'token') {
          signedTx = transfer({ 
            recipient: data.target,
            // ID of a token, or WAVES
            assetId: '', // defaults to WAVES
            // The real amount is the given number divided by 10^(precision of the token)
            amount: parseInt(data.amount),
            feeAssetId: '', // defaults to WAVES
            fee: parseInt(data.fee), // is optional
            // 140 bytes of data (it's allowed to use Uint8Array here)
            attachment: '', //FUTURE: add a message?
            //feeAssetId: undefined
            //timestamp: 1536917842558, //Timestamp is optional but it was overrided, in case timestamp is not provided it will fallback to Date.now()
          }, seed);

        } else {

          signedTx = transfer({ 
            recipient: data.target,
            // ID of a token, or WAVES
            assetId: data.contract,
            // The real amount is the given number divided by 10^(precision of the token)
            amount: parseInt(data.amount),
            feeAssetId: '', // defaults to WAVES
            fee: parseInt(data.fee), // is optional
            // 140 bytes of data (it's allowed to use Uint8Array here)
            attachment: '', //FUTURE: add a message?
            //feeAssetId: undefined
            //timestamp: 1536917842558, //Timestamp is optional but it was overrided, in case timestamp is not provided it will fallback to Date.now()
          }, seed);
        }
        
        signedTx.attachment = '';
        
        callback(JSON.stringify(signedTx));
        //return JSON.stringify(signedTx);

      }
    }
    return functions;
  }
)();

// export the functionality to a pre-prepared var
window.deterministic = wrapper;
