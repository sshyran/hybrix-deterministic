// (C) 2018 Internet of Coins
// hybridd module - electrum/deterministic_source.js
// Deterministic encryption wrapper for ZCash
//
// [!] Browserify this and save to deterministic.js.lzma to enable sending it from hybridd to the browser!
//

var wrapper = (
  function() {

    var functions = {         
      // create deterministic public and private keys based on a seed
      keys : function(data) {
        var seed = new Buffer(data.seed);
        var hash = wrapperlib.zcash.crypto.Hash.sha256(seed);
        var bn = wrapperlib.zcash.crypto.BN.fromBuffer(hash);

        var privk = new wrapperlib.zcash.PrivateKey(bn);

        var wif = privk.toWIF();
        return { WIF:wif };                 // returns object { WIF:'Kxr9tQED9H44gCmp6HAdmemAzU3n84H3dGkuWTKvE23JgHMW8gct' }
      },

      // generate a unique wallet address from a given public key
      address : function(data) {
        var privKey = wrapperlib.zcash.PrivateKey(data.WIF, data.mode);
        return privKey.toAddress();
      },

      transaction : function(data) {
        var privKey = wrapperlib.zcash.PrivateKey(data.keys.WIF, data.mode);

        var tx = new wrapperlib.zcash.Transaction();

        // add inputs
        for (var i in data.unspent.unspents) {
          tx.from({ txId:        data.unspent.unspents[i].txid,
                    outputIndex: parseInt(data.unspent.unspents[i].txn),
                    address:     data.unspent.unspents[i].address,
                    script:      data.unspent.unspents[i].script,
                    satoshis:    parseInt(data.unspent.unspents[i].amount)
                  });
        }

        // add outputs
        tx.to(data.target, parseInt(data.amount));
        var outchange = parseInt(data.unspent.change); // fee is already being deducted when calculating unspents
        if (outchange > 0) {
          tx.to(data.source, outchange);
        }

        // sign inputs
        tx.sign(privKey);

        return tx.serialize();
      }
    }

    return functions;
  }
)();

// export the functionality to a pre-prepared var
deterministic = wrapper;
