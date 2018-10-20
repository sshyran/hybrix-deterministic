// (C) 2018 Internet of Coins / Gijs-Jan van Dompseler
// hybridd module - dummycoin/deterministic.js
// Deterministic encryption wrapper for Dash
window.dashcore = require('./dashcore-lib.min');


var wrapper = (
  function () {

    var functions = {
      // create deterministic public and private keys based on a seed
      // https://github.com/dashevo/dashcore-lib/blob/master/docs/examples.md
      keys: function (data) {
        var seed = new Buffer(data.seed);
        var hash = window.dashcore.crypto.Hash.sha256(seed);
        var bn = window.dashcore.crypto.BN.fromBuffer(hash);

        var privateKey = new window.dashcore.PrivateKey(bn, 'livenet');
        var wif = privateKey.toWIF();

        return { WIF: wif };
      },

      // generate a unique wallet address from a given public key
      address: function (data) {
        var privateKey = new window.dashcore.PrivateKey(data.WIF, 'livenet');
        var address = privateKey.toAddress();
        if (!window.dashcore.Address.isValid(address, 'livenet')) {
          throw new Error("Can't generate address from private key. "
            + "Generated address " + address
            + "is not valid for " + data.mode);
        }

        return address;
      },

      transaction: function (data, callback) {

        var privateKey = window.dashcore.PrivateKey(data.keys.WIF, 'livenet');

        var transaction = new window.dashcore.Transaction()
            .from(data.unspent.unspents)
            .to(data.target, 15000)
            .sign(privateKey);

        var result = transaction.serialize();

        callback(result);
      }
    }

    return functions;
  }
)();

// export the functionality to a pre-prepared var
window.deterministic = wrapper;
