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
const privateKey = 'da146374a75310b9666e834ee4ad0866d6f4035967bfc76217c5a495fff9f0d0'; // GET FROM ACCOUNT?

const hex2base32 = require('./../../common/crypto/hex2base32.js')
const createAddressUrl = 'https://api.trongrid.io/wallet/createaddress';

const tronWeb = new TronWeb(
  fullNode,
  solidityNode,
  eventServer,
  privateKey
)

GL.tronWeb = tronWeb;

var wrapper = (
  function() {

    var functions = {
      // create deterministic public and private keys based on a seed
      keys : data => {
        console.log('loei', hex2base32.base32ToHex(data.seed))
        return {
          privateKey: hex2base32.base32ToHex(data.seed)
        }
      },

      // generate a unique wallet address from a given public key
      address : function (data, cb) {
        return tronWeb.address.fromPrivateKey(data.privateKey)
      },
      // return public key
      publickey : function (data) {
        return tronWeb.address.fromPrivateKey(data.privateKey)
      },

      // return private key
      privatekey : function (data) {
        return data.privateKey
      },

      // generate a transaction
      transaction : function (data, callback) {
        const privateKey_ = data.keys.privateKey;
        const target = data.target;
        const address = data.source;
        const amount = Number(data.amount);

        tronWeb.transactionBuilder.sendTrx(target, amount, address)
          .then(tx => tronWeb.trx.sign(tx, privateKey_, true)
                .then(signedTx => {
                  callback(Buffer.from(JSON.stringify(signedTx), 'utf-8').toString('hex'));
                })
                .catch(callback))
          .catch(callback)
        //
      }
    }

    return functions;
  }
)();

// export the functionality to a pre-prepared var
window.deterministic = wrapper;
