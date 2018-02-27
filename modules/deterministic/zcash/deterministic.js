// (C) 2018 Internet of Coins
// hybridd module - electrum/deterministic_source.js
// Deterministic encryption wrapper for ZCash
//
// [!] Browserify this and save to deterministic.js.lzma to enable sending it from hybridd to the browser!
//

var wrapper = (
  function() {

    toSatoshis = function(float, factor) {
      return float * Math.pow(10, factor);
    }

    var functions = {
      // create deterministic public and private keys based on a seed
      keys : function(data) {
        var seed = new Buffer(data.seed);
        var hash = wrapperlib.zcash.crypto.Hash.sha256(seed);
        var bn   = wrapperlib.zcash.crypto.BN.fromBuffer(hash);

        var privKey = new wrapperlib.zcash.PrivateKey(bn, data.mode);
        var wif     = String(privKey.toWIF());
        return { WIF:wif };
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
                           satoshis:    toSatoshis(utxo.amount, data.factor)
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
deterministic = wrapper;
