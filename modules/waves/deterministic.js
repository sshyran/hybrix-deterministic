// (C) 2017 Internet of Coins / Metasync / Joachim de Koning
// hybridd module - waves/deterministic.js
// Deterministic encryption wrapper for Waves

function uglyClone(obj){return JSON.parse(JSON.stringify(obj));}

// this to prevent waves api from connecting with waves server, we only want the signed tx, not the pushing of the signed tx.
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

var wrapperlib = require('./wrapperlib');

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
        var txParams;
        if (data.mode !== 'token') {
          txParams = {
            recipient: data.target,
            // ID of a token, or WAVES
            assetId: 'WAVES',
            // The real amount is the given number divided by 10^(precision of the token)
            amount: parseInt(data.amount),
            // The same rules for these two fields
            feeAssetId: 'WAVES',
            fee: parseInt(data.fee),
            // 140 bytes of data (it's allowed to use Uint8Array here)
            attachment: '', //FUTURE: add a message?
            timestamp: Date.now()
          };

        } else {

          txParams = {
            recipient: data.target,
            // ID of a token, or WAVES
            assetId: data.contract,
            // The real amount is the given number divided by 10^(precision of the token)
            amount: parseInt(data.amount),
            // The same rules for these two fields
            feeAssetId: 'WAVES',
            fee: parseInt(data.fee),
            // 140 bytes of data (it's allowed to use Uint8Array here)
            attachment: '', //FUTURE: add a message?
            timestamp: Date.now()
          };
        }
        var fThen1 = (x) => {};
        var fThen2 = (x) => {};
        var fCatch = (x) => {
          if(x.data){
            callback(x.data.body.replace('\"','"'));
          }else{
            callback('Error: Waves transaction build failure!'); //issue with crypto
          }
        }

/*
[Log] catch
WavesRequestError: Server request to 'https://nodes.wavesnodes.com/assets/broadcast/transfer' has failed: { "method": "POST", "headers": { "Accept": "application/json", "Content-Type": "application/json;charset=UTF-8" }, "body": "{\"senderPublicKey\":\"3jMsaNAfTUJcYZm8Bv9JqgpBEg7YRE7v8zu29VUxZNkF\",\"assetId\":\"\",\"feeAssetId\":\"\",\"timestamp\":1536764828876,\"amount\":100000,\"fee\":1000000,\"recipient\":\"address:3PBUkL5rphESXxq1yJzW2erVzTTKAXXeCUo\",\"attachment\":\"\",\"signature\":\"4QCZpeyv3TAJQqmYJDgXgy3bLtmivv8VkMi2zoirC51zcaB9XewWw5a67E1rVAGS9CzE1AaoU5YTy3oCu1V8U172\"}" }
*/
        Waves.API.Node.v1.assets.transfer(txParams, data.keys.keyPair).then(fThen1).then(fThen2).catch(fCatch);

      }
    }
    return functions;
  }
)();

// export the functionality to a pre-prepared var
window.deterministic = wrapper;
