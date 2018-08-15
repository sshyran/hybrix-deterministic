// (C) 2015 Internet of Coins / Metasync / Joachim de Koning
// hybridd module - ark/deterministic.js
// Deterministic encryption wrapper for Ark
//
// [!] Browserify this and save to deterministic.js.lzma to enable sending it from hybridd to the browser!
//

var wrapperlib = require('./ark-js-mod/index');

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
        return wrapperlib.crypto.getAddress(data.publicKey);
      },

      transaction : function(data) {
        // return deterministic transaction data
        return JSON.stringify( wrapperlib.transaction.createTransaction(data.target, parseInt(data.amount), null, data.seed) );
        // for more information see: https://github.com/corsaro1/lisk_broadcast
      }

    }
    return functions;
  }
)();

// export the functionality to a pre-prepared var
window.deterministic = wrapper;
