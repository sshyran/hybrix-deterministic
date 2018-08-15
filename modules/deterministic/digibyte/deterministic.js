// (C) 2015 Internet of Coins / Metasync / Joachim de Koning
// hybridd module - electrum/deterministic_source.js
// Deterministic encryption wrapper for Bitcoin
//
// [!] Browserify this and save to deterministic.js.lzma to enable sending it from hybridd to the browser!
//

// inclusion of necessary requires

Decimal = require('../../../lib/crypto/decimal-light'); Decimal.set({ precision: 64 });

// shim for randomBytes to avoid require('crypto') incompatibilities
// solves bug: "There was an error collecting entropy from the browser
const randomBytes = crypto.randomBytes;
if (typeof window === 'object') {
  const wCrypto = window.crypto || {}
  if (!wCrypto.getRandomValues) {
    wCrypto.getRandomValues = function getRandomValues (arr) {
      const bytes = randomBytes(arr.length)
      for (var i = 0; i < bytes.length; i++) {
        arr[i] = bytes[i]
      }
    }
  }
}

var wrapperlib = require('./wrapperlib');

var wrapper = (
  function() {
    var base58 = require('bs58');
    var ecurve = require('ecurve');
    var BigInteger = require('bigi');
    // DISABLED INSIDE wrapper FUNCTION: var wrapperlib = require('bitcoinjs-lib');

    var functions = {
      // create deterministic public and private keys based on a seed
      keys : function(data) {
        var seed = new Buffer(data.seed);
        var hash = wrapperlib.crypto.Hash.sha256(seed);
        var bn   = wrapperlib.crypto.BN.fromBuffer(hash);

        var privKey = new wrapperlib.PrivateKey(bn, data.mode);
        var wif     = privKey.toWIF();

        return { WIF: wif };
      },

      // generate a unique wallet address from a given public key
      address : function(data) {
        var privKey = wrapperlib.PrivateKey(data.WIF, data.mode);
        var addr    = privKey.toAddress();

        if (!wrapperlib.Address.isValid(addr, data.mode)) {
          throw new Error("Can't generate address from private key. "
                             + "Generated address " + addr
                             + "is not valid for " + data.mode);
        }

        return addr.toString();
      },

      transaction : function(data) {
        var privKey       = wrapperlib.PrivateKey(data.keys.WIF, data.mode);
        var recipientAddr = wrapperlib.Address(data.target, data.mode);
        var changeAddr    = wrapperlib.Address(data.source, data.mode);

        /* DEBUG
        data.unspent.unspents.map(function(utxo){
                  logger(JSON.stringify(
                        { txId:        utxo.txid,
                           outputIndex: utxo.txn,
                           address:     utxo.address,
                           script:      utxo.script,
                           satoshis:    parseInt(toSatoshis(utxo.amount,data.factor))
                         } ));
                });
        */

        var tx = new wrapperlib.Transaction()
          .from(data.unspent.unspents.map(function(utxo){
                  return { txId:        utxo.txid,
                           outputIndex: utxo.txn,
                           address:     utxo.address,
                           script:      utxo.script,
                           satoshis:    parseInt(toSatoshis(utxo.amount,data.factor))
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
