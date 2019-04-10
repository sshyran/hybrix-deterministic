// (C) 2018 Internet of Coins
// hybrixd module - electrum/deterministic_source.js
// Deterministic encryption wrapper for ZCash

let wrapperlib = require('./wrapperlib');

let wrapper = (
  function () {
    let functions = {
      // create deterministic public and private keys based on a seed
      keys: function (data) {
        let seed = Buffer.from(data.seed);
        let hash = wrapperlib.zcash.crypto.Hash.sha256(seed);
        let bn = wrapperlib.zcash.crypto.BN.fromBuffer(hash);

        let privKey = new wrapperlib.zcash.PrivateKey(bn, data.mode);
        let wif = privKey.toWIF();

        return { WIF: wif };
      },

      // generate a unique wallet address from a given public key
      address: function (data) {
        let privKey = wrapperlib.zcash.PrivateKey(data.WIF, data.mode);
        let addr = privKey.toAddress();

        if (!wrapperlib.zcash.Address.isValid(addr, data.mode)) {
          throw new Error("Can't generate address from private key. " +
                             'Generated address ' + addr +
                             'is not valid for ' + data.mode);
        }

        return addr.toString();
      },

      // return public key
      publickey: function (data) {
        let privKey = wrapperlib.zcash.PrivateKey(data.WIF, data.mode);
        return new wrapperlib.zcash.PublicKey(privKey).toString('hex');
      },

      // return private key
      privatekey: function (data) {
        return data.WIF;
      },

      transaction: function (data) {
        let privKey = wrapperlib.zcash.PrivateKey(data.keys.WIF, data.mode);
        let recipientAddr = wrapperlib.zcash.Address(data.target, data.mode);
        let changeAddr = wrapperlib.zcash.Address(data.source, data.mode);

        let tx = new wrapperlib.zcash.Transaction()
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
