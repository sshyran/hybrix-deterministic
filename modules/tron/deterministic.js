// (C) 2015 Internet of Coins / Metasync / Joachim de Koning
// hybrixd module - tron/deterministic.js
// Deterministic encryption wrapper for Tron
//

const hex2base32 = require('./../../common/crypto/hex2base32.js');

const CryptoUtils = require('@tronscan/client/src/utils/crypto');
const TransactionUtils = require('@tronscan/client/src/utils/transactionBuilder');

let wrapper = (
  function () {
    let functions = {
      // create deterministic public and private keys based on a seed
      keys: data => {
        return {
          privateKey: hex2base32.base32ToHex(data.seed)
        };
      },

      // generate a unique wallet address from a given public key
      address: function (data, cb) {
        return CryptoUtils.getBase58CheckAddressFromPriKeyBase64String(data.privateKey);
      },
      // return public key
      publickey: function (data) {
        let buffer = new Buffer(data.privateKey, 'utf16le');
        return CryptoUtils.getPubKeyFromPriKey(buffer).toString('utf8');
      },

      // return private key
      privatekey: function (data) {
        return data.privateKey;
      },

      // generate a transaction
      transaction: function (data, callback) {
        const privateKey = data.keys.privateKey;
        const target = data.target;
        const address = data.source;
        const amount = Number(data.amount);
        const token = data.contract.toUpperCase();
        let transaction = TransactionUtils.buildTransferTransaction(token, address, target, amount);
        let signedTransaction = CryptoUtils.signTransaction(privateKey, transaction);
        return signedTransaction;
      }
    };

    return functions;
  }
)();

// export the functionality to a pre-prepared var
window.deterministic = wrapper;
