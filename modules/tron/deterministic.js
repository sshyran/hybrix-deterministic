// (C) 2015 Internet of Coins / Metasync / Joachim de Koning
// hybrixd module - dummycoin/deterministic.js
// Deterministic encryption wrapper for Tron
//
// [!] Browserify this and save to deterministic.js.lzma to enable sending it from hybrixd to the browser!
//

const TronWeb = require('tronweb');

const fullNode = 'https://api.trongrid.io';
const solidityNode = 'https://api.trongrid.io';
const eventServer = 'https://api.trongrid.io/';

const hex2base32 = require('./../../common/crypto/hex2base32.js');
// const TransactionUtils = require('../../node_modules/tronweb/src/lib/transactionBuilder');

const CryptoUtils = require('@tronscan/client/src/utils/crypto');
const TransactionUtils = require('@tronscan/client/src/utils/transactionBuilder');

const tronWeb = new TronWeb(
  fullNode,
  solidityNode,
  eventServer
);

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
        return tronWeb.address.fromPrivateKey(data.privateKey);
      },
      // return public key
      publickey: function (data) {
        return tronWeb.address.fromPrivateKey(data.privateKey);
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
