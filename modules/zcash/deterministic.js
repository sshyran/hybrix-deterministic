// (C) 2018 Internet of Coins
// hybrixd module - electrum/deterministic_source.js
// Deterministic encryption wrapper for ZCash

var wrapperlib = require('./wrapperlib');

var wrapper = (
  function () {

    var functions = {
      // create deterministic public and private keys based on a seed
      keys : function(data) {
        var seed = new Buffer(data.seed);
        var hash = wrapperlib.zcash.crypto.Hash.sha256(seed);
        var bn   = wrapperlib.zcash.crypto.BN.fromBuffer(hash);

        var privKey = new wrapperlib.zcash.PrivateKey(bn, data.mode);
        var wif     = privKey.toWIF();

        return { WIF: wif };
      },

      // generate a unique wallet address from a given public key
      address : function(data) {
        var privKey = wrapperlib.zcash.PrivateKey(data.WIF, data.mode);
        var addr    = privKey.toAddress();

        if (!wrapperlib.zcash.Address.isValid(addr, data.mode)) {
          throw new Error("Can't generate address from private key. "
                             + "Generated address " + addr
                             + "is not valid for " + data.mode);
        }

        return addr.toString();
      },

      // return public key
      publickey : function(data) {
        var privKey = wrapperlib.zcash.PrivateKey(data.WIF, data.mode);
        return new wrapperlib.zcash.PublicKey(privKey).toString('hex');
      },

      // return private key
      privatekey : function(data) {
        return data.WIF;
      },

      transaction : function(data) {
        var privKey       = wrapperlib.zcash.PrivateKey(data.keys.WIF, data.mode);
        var recipientAddr = wrapperlib.zcash.Address(data.target, data.mode);
        var changeAddr    = wrapperlib.zcash.Address(data.source, data.mode);

        var tx = new wrapperlib.zcash.Transaction()
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
