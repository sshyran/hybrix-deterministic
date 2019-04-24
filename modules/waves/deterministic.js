// (C) 2017 Internet of Coins / Metasync / Joachim de Koning
// hybrixd module - waves/deterministic.js
// Deterministic encryption wrapper for Waves

let wrapperlib = require('./wrapperlib');
const { transfer } = require('waves-transactions');

function uglyClone (obj) { return JSON.parse(JSON.stringify(obj)); }

let wrapper = (
  function () {
    let Waves = wrapperlib.create(wrapperlib.MAINNET_CONFIG);

    let functions = {

      // create deterministic public and private keys based on a seed
      keys: function (data) {
        return uglyClone(Waves.Seed.fromExistingPhrase(data.seed));
      },

      // return public address
      address: function (data) {
        return uglyClone(data.address);
      },

      // return public key TODO
      publickey: function (data) {
        return uglyClone(data.keyPair.publicKey);
      },

      // return private key TODO
      privatekey: function (data) {
        return uglyClone(data.keyPair.privateKey);
      },

      transaction: function (data, callback) {
        const seed = data.seed;
        let signedTx;
        const hasValidMessage = typeof data.message !== 'undefined' && data.message !== null && data.message !== '';
        const messageOrEmpty = hasValidMessage ? data.message : '';

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
            attachment: messageOrEmpty,
            // feeAssetId: undefined
            timestamp: data.time // Timestamp is optional but it was overrided, in case timestamp is not provided it will fallback to Date.now()
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
            attachment: messageOrEmpty,
            // feeAssetId: undefined
            timestamp: data.time // Timestamp is optional but it was overrided, in case timestamp is not provided it will fallback to Date.now()
          }, seed);
        }
        signedTx.attachment = messageOrEmpty;
        callback(JSON.stringify(signedTx));
        // return JSON.stringify(signedTx);
      }
    };
    return functions;
  }
)();

// export the functionality to a pre-prepared var
window.deterministic = wrapper;
