// (C) 2015 Internet of Coins / Metasync / Joachim de Koning
// hybridd module - dummycoin/deterministic.js
// Deterministic encryption wrapper for Dummy test coin
//
// [!] Browserify this and save to deterministic.js.lzma to enable sending it from hybridd to the browser!
//
var wrapperlib = require('./wrapperlib');

var wrapper = (
  function() {

    var functions = {
      // create deterministic public and private keys based on a seed
      keys : function(data) {
        return wrapperlib.keys(data);
      },

      // generate a unique wallet address from a given public key
      address : function(data) {
        return wrapperlib.address(data);
      },

      transaction : function(data, callback) {
        return wrapperlib.transaction(data,callback);
      }
    }

    return functions;
  }
)();

// export the functionality to a pre-prepared var
deterministic = wrapper;
