// (C) 2017 Internet of Coins / Metasync / Joachim de Koning
// hybrixd module - ethereum/deterministic.js
// Deterministic encryption wrapper for NXT
let wrapperlib = require('./wrapperlib');

let wrapper = (
  function () {
    let functions = {
      // create deterministic public and private keys based on a seed
      keys: function (data) {
        let publicKey = wrapperlib.secretPhraseToPublicKey(data.seed);
        // simply pass the unique seed as secret phrase to the NXT library
        return {
          publicKey: publicKey,
          secretPhrase: data.seed
        };
      },

      importKeys: function (data) {
        let publicKey = wrapperlib.secretPhraseToPublicKey(data.privateKey);
        return {
          publicKey: publicKey,
          secretPhrase: data.privateKey
        };
      },

      // generate a unique wallet address from a given public key
      address: function (data) {
        let address = wrapperlib.publicKeyToAccountId(data.publicKey);
        let output = null;
        switch (data.mode) {
          case 'burst':
            output = 'BURST' + address.substr(3);
            break;
          case 'burst-token':
            output = 'BURST' + address.substr(3);
            break;
          case 'elastic':
            output = 'XEL' + address.substr(3);
            break;
          case 'elastic-token':
            output = 'XEL' + address.substr(3);
            break;
          default:
            output = address;
            break;
        }
        return output;
      },

      // return public key
      publickey: function (data) {
        return data.publicKey;
      },

      // return private key
      privatekey: function (data) {
        return data.secretPhrase;
      },

      transaction: function (data) {
        if (typeof data.unspent.unsignedTransactionBytes !== 'undefined') {
          return wrapperlib.signTransactionBytes(data.unspent.unsignedTransactionBytes, data.keys.secretPhrase);
        } else {
          return null;
        }
      }
    };
    return functions;
  }
)();

// export the functionality to a pre-prepared var
window.deterministic = wrapper;
