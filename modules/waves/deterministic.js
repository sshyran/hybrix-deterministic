// (C) 2017 Internet of Coins / Metasync / Joachim de Koning
// hybridd module - waves/deterministic.js
// Deterministic encryption wrapper for Waves

function uglyClone(obj){return JSON.parse(JSON.stringify(obj));}

// Why this? When I rm it, stuff still works... Why update window object.
const randomBytes = crypto.randomBytes;
if (typeof window === 'object') {
  const wCrypto = window.crypto || {};
  if (!wCrypto.getRandomValues) {
    wCrypto.getRandomValues = function getRandomValues (arr) {
      const bytes = randomBytes(arr.length);
      for (var i = 0; i < bytes.length; i++) {
        arr[i] = bytes[i];
      }
    }
  }
}

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

      keys: function(data) {
        return uglyClone(Waves.Seed.fromExistingPhrase(data.seed));
      },

      address: function(data) {
        return uglyClone(data.address);
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

        Waves.API.Node.v1.assets.transfer(txParams, data.keys.keyPair).then((responseData) => { }).then(function (error) {}).catch(function (error) {
          var transactionId = (typeof error.data.body === 'string')?error.data.body:JSON.stringify(error.data.body);
          callback(transactionId); // Since we've hacked the fetch command it will error, but we don't need the result, we need the request
        });

      }
    }
    return functions;
  }
)();

// export the functionality to a pre-prepared var
window.deterministic = wrapper;
