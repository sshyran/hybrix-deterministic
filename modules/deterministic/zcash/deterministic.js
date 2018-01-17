// (C) 2018 Internet of Coins
// hybridd module - electrum/deterministic_source.js
// Deterministic encryption wrapper for ZCash
//
// [!] Browserify this and save to deterministic.js.lzma to enable sending it from hybridd to the browser!
//

var wrapper = (
  function() {
    var base58 = require('bs58');
    var ecurve = require('ecurve');
    var BigInteger = require('bigi');

    var functions = {         
      // create deterministic public and private keys based on a seed
      keys : function(data) {
        console.log("keys data.mode: ", data.mode);
        var seed = new Buffer(data.seed);
        var hash = wrapperlib.zcash.crypto.Hash.sha256(seed);
        var bn = wrapperlib.zcash.crypto.BN.fromBuffer(hash);

        var privk = new wrapperlib.zcash.PrivateKey(bn, data.mode);

        var wif = privk.toWIF();
        console.log("zcash-bitcore WIF: ", wif);


        // { // this zcash-bitcoinjs-based code produces WIF, which used by bitcore
        //   // corresponds to tmTenn5WF8fPp8mg5W8xZU2JwyEqaJvY3BE address
        //   // from the same seed. Bitcoinjs itself, though, unable to generate address correctly

        //   var hash = wrapperlib.zcashjs.crypto.sha256(data.seed);
        //   var privk = BigInteger.fromBuffer(hash);
        //   var pubk  = null;

        //   var keyPair = new wrapperlib.zcashjs.ECPair(privk, pubk, {
        //                   compressed: false,
        //                   network: wrapperlib.zcashjs.networks[data.mode]
        //                 });
        //   var wif = keyPair.toWIF();

        //   console.log("zcash-bitcoinjs WIF: ", wif);

        //   var keyPair = wrapperlib.zcashjs.ECPair.fromWIF(wif, wrapperlib.zcashjs.networks[data.mode])
        //   console.log("zcash-bitcoinjs address: ", keyPair.getAddress());
        // }

        console.log("Resulting WIF: ", wif);
        return { WIF: wif };
      },

      // generate a unique wallet address from a given public key
      address : function(data) {
        console.log("address data.mode: ", data.mode);

        var privKey = wrapperlib.zcash.PrivateKey(data.keys.WIF, data.mode);
        console.log("zcash-bitcore address valid: ", wrapperlib.zcash.Address.isValid(privKey.toAddress(), data.mode));
        console.log("zcash-bitcore address: ", privKey.toAddress());

        // var keyPair = wrapperlib.zcashjs.ECPair.fromWIF(data.keys.WIF, wrapperlib.zcashjs.networks[data.mode])
        // console.log("zcash-bitcoinjs address: ", keyPair.getAddress());

        return privKey.toAddress();
      },

      transaction : function(data) {
        console.log("transaction data.mode: ", data.mode);
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


        // var privateKey = new bitcore.PrivateKey('L1uyy5qTuGrVXrmrsvHWHgVzW9kKdrp27wBC7Vs6nZDTF2BRUVwy');
        // var utxo = {
        //   "txId" : "115e8f72f39fad874cfab0deed11a80f24f967a84079fb56ddf53ea02e308986",
        //   "outputIndex" : 0,
        //   "address" : "17XBj6iFEsf8kzDMGQk5ghZipxX49VXuaV",
        //   "script" : "76a91447862fe165e6121af80d5dde1ecb478ed170565b88ac",
        //   "satoshis" : 50000
        // };

        // var transaction = new wrapperlib.zcash.Transaction()
        //   .from(utxo)
        //   .to('tmWo6RU62mqrSVaqtqPEcFbpfYfvKreui5p', 15000)
        //   .sign(privKey);


        return tx.serialize();
      }
    }

    return functions;
  }
)();

// export the functionality to a pre-prepared var
deterministic = wrapper;
