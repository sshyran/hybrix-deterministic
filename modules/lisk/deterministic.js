// (C) 2015 Internet of Coins / Metasync / Joachim de Koning
// hybridd module - lisk/deterministic.js
// Deterministic encryption wrapper for Lisk
//
// [!] Browserify this and save to deterministic.js.lzma to enable sending it from hybridd to the browser!
//

var wrapperlib = require('./lisk-js/index.js');

var wrapper = (
  function() {

    var functions = {
      // create deterministic public and private keys based on a seed
      keys : function(data) {
        // return object { publicKey:'', privateKey:'' }
        return wrapperlib.crypto.getKeys(data.seed);
      },

      // generate a unique wallet address from a given public key
      address : function(data) {
        var address = wrapperlib.crypto.getAddress(data.publicKey);
        var output = null;
        switch (data.mode) {
        case 'rise':
          output = address.substr(0,address.length-1)+'R';
          break;
        case 'shift':
          output = address.substr(0,address.length-1)+'S';
          break;
        default:
          output = address;
          break;
        }
        return output;
      },

      // return public key
      publickey : function(data) {
        return data.publicKey;
      },

      // return private key
      privatekey : function(data) {
        return data.privateKey;
      },

      transaction : function(data) {
        // return deterministic transaction data
        var tx = wrapperlib.transaction.createTransaction(data.target, parseInt(data.amount), data.seed) ;
        if(data.mode === 'lisk'){ // added to match new lisk API, rise and shift still using old
          tx.amount = String(tx.amount);
          tx.fee = String(tx.fee);
        }
        return JSON.stringify(tx);

      // example: lisk.transaction.createTransaction("1859190791819301L", amount, "passphrase", "secondPassphrase");
        // for more information see: https://github.com/corsaro1/lisk_broadcast
      }
    }
    return functions;
  }
)();

// export the functionality to a pre-prepared var
window.deterministic = wrapper;
