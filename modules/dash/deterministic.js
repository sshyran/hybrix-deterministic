// (C) 2018 Internet of Coins / Gijs-Jan van Dompseler / Joachim de Koning
// hybridd module - dummycoin/deterministic.js
// Deterministic encryption wrapper for Dash

wrapperlib = require('./wrapperlib');

var wrapper = (
  function () {

    var functions = {
      // create deterministic public and private keys based on a seed
      // https://github.com/dashevo/dashcore-lib/blob/master/docs/examples.md
      keys : function(data) {
        var seed = new Buffer(data.seed);
        var hash = wrapperlib.dashcore.crypto.Hash.sha256(seed);
        var bn = wrapperlib.dashcore.crypto.BN.fromBuffer(hash);

        var privateKey = new wrapperlib.dashcore.PrivateKey(bn, data.mode);
        var wif = privateKey.toWIF();

        return { WIF: wif };
      },

      // generate a unique wallet address from a given public key
      address : function(data) {
        var privateKey = new wrapperlib.dashcore.PrivateKey(data.WIF, data.mode);
        var address = privateKey.toAddress();
        if (!wrapperlib.dashcore.Address.isValid(address, data.mode)) {
          throw new Error("Can't generate address from private key. "
                             + "Generated address " + address
                             + "is not valid for " + data.mode);
        }

        return address.toString();
      },

      // return public key
      publickey : function(data) {
        var privKey = wrapperlib.dashcore.PrivateKey(data.WIF, data.mode);
        return new wrapperlib.dashcore.PublicKey(privKey).toString('hex');
      },

      // return private key
      privatekey : function(data) {
        return data.WIF;
      },

      transaction : function(data) {
        var privKey       = wrapperlib.dashcore.PrivateKey(data.keys.WIF, data.mode);
        var recipientAddr = wrapperlib.dashcore.Address(data.target, data.mode);
        var changeAddr    = wrapperlib.dashcore.Address(data.source, data.mode);

        var tx = new wrapperlib.dashcore.Transaction()
          .from(data.unspent.unspents.map(function(utxo){
                  return { txId:        utxo.txid,
                           outputIndex: utxo.txn,
                           address:     utxo.address,
                           script:      utxo.script,
                           satoshis:    parseInt(utxo.amount)
                         };
                }))
          .to(recipientAddr, parseInt(data.amount))
          .fee(parseInt(data.fee))
          .change(changeAddr)
          .sign(privKey);
          
        return tx.serialize();
      }
    }

    return functions;
  }
)();

// export the functionality to a pre-prepared var
window.deterministic = wrapper;
