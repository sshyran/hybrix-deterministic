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

    toSatoshis = function(float, factor) {
      return float * Math.pow(10, factor);
    }

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
