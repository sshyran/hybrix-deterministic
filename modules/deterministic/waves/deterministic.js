// (C) 2017 Internet of Coins / Metasync / Joachim de Koning
// hybridd module - waves/deterministic.js
// Deterministic encryption wrapper for Waves

function uglyClone(obj){return JSON.parse(JSON.stringify(obj));}


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
deterministic = wrapper;
