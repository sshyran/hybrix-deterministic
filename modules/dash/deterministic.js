// (C) 2018 Internet of Coins / Gijs-Jan van Dompseler / Joachim de Koning
// Deterministic encryption wrapper for Dash

let wrapperlib = require('./wrapperlib');

let wrapper = (
  function () {
    let functions = {
      // create deterministic public and private keys based on a seed
      // https://github.com/dashevo/dashcore-lib/blob/master/docs/examples.md
      keys: function (data) {
        let seed = Buffer.from(data.seed);
        let hash = wrapperlib.dashcore.crypto.Hash.sha256(seed);
        let bn = wrapperlib.dashcore.crypto.BN.fromBuffer(hash);

        let privateKey = new wrapperlib.dashcore.PrivateKey(bn, data.mode);
        let wif = privateKey.toWIF();

        return { WIF: wif };
      },
      // TODO importPublic
      // TODO sumKeys

      importPrivate: function (data) {
        return {WIF: data.privateKey};
      },

      // generate a unique wallet address from a given public key
      address: function (data) {
        let privateKey = new wrapperlib.dashcore.PrivateKey(data.WIF, data.mode);
        let address = privateKey.toAddress();
        if (!wrapperlib.dashcore.Address.isValid(address, data.mode)) {
          throw new Error("Can't generate address from private key. " +
                             'Generated address ' + address +
                             'is not valid for ' + data.mode);
        }

        return address.toString();
      },

      // return public key
      publickey: function (data) {
        let privKey = wrapperlib.dashcore.PrivateKey(data.WIF, data.mode);
        return new wrapperlib.dashcore.PublicKey(privKey).toString('hex');
      },

      // return private key
      privatekey: function (data) {
        return data.WIF;
      },

      transaction: function (data) {
        let privKey = wrapperlib.dashcore.PrivateKey(data.keys.WIF, data.mode);
        let recipientAddr = wrapperlib.dashcore.Address(data.target, data.mode);
        let changeAddr = wrapperlib.dashcore.Address(data.source, data.mode);

        let tx = new wrapperlib.dashcore.Transaction()
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
