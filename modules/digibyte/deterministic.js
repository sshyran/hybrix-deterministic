// (C) 2018 Internet of Coins / Metasync / Joachim de Koning
// Deterministic encryption wrapper for Digibyte
//
// [!] Browserify this and save to deterministic.js.lzma to enable sending it from hybrixd to the browser!
//

// inclusion of necessary requires
let wrapperlib = require('./wrapperlib');
// Decimal = require('../../common/crypto/decimal-light'); Decimal.set({ precision: 64 });

// shim for randomBytes to avoid require('crypto') incompatibilities
// solves bug: "There was an error collecting entropy from the browser
const randomBytes = crypto.randomBytes;
if (typeof window === 'object') {
  const wCrypto = window.crypto || {};
  if (!wCrypto.getRandomValues) {
    wCrypto.getRandomValues = function getRandomValues (arr) {
      const bytes = randomBytes(arr.length);
      for (let i = 0; i < bytes.length; i++) {
        arr[i] = bytes[i];
      }
    };
  }
}

let wrapper = (
  function () {
    let functions = {
      // create deterministic public and private keys based on a seed
      keys: function (data) {
        let seed = Buffer.from(data.seed);
        let hash = wrapperlib.crypto.Hash.sha256(seed);
        let bn = wrapperlib.crypto.BN.fromBuffer(hash);

        let privKey = new wrapperlib.PrivateKey(bn, data.mode);
        let wif = privKey.toWIF();

        return { WIF: wif };
      },

      // generate a unique wallet address from a given public key
      address: function (data) {
        let privKey = wrapperlib.PrivateKey(data.WIF, data.mode);
        let addr = privKey.toAddress();

        if (!wrapperlib.Address.isValid(addr, data.mode)) {
          throw new Error("Can't generate address from private key. " +
                             'Generated address ' + addr +
                             'is not valid for ' + data.mode);
        }

        return addr.toString();
      },

      // return public key
      publickey: function (data) {
        let privKey = wrapperlib.PrivateKey(data.WIF, data.mode);
        return new wrapperlib.PublicKey(privKey).toString('hex');
      },

      // return private key
      privatekey: function (data) {
        return data.WIF;
      },

      transaction: function (data) {
        let privKey = wrapperlib.PrivateKey(data.keys.WIF, data.mode);
        let recipientAddr = wrapperlib.Address(data.target, data.mode);
        let changeAddr = wrapperlib.Address(data.source, data.mode);

        let tx = new wrapperlib.Transaction()
          .from(data.unspent.unspents.map(function (utxo) {
            return { txId: utxo.txid,
              outputIndex: utxo.txn,
              address: utxo.address,
              script: utxo.script,
              satoshis: parseInt(utxo.amount)
            };
          }))
          .to(recipientAddr, parseInt(data.amount))
          .fee(parseInt(data.fee))
          .change(changeAddr)
          .sign(privKey);

        return tx.serialize();
      }
    };
    return functions;
  }
)();

// export the functionality to a pre-prepared var
window.deterministic = wrapper;
