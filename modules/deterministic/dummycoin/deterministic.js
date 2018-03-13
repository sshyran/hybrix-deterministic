// (C) 2015 Internet of Coins / Metasync / Joachim de Koning
// hybridd module - dummycoin/deterministic.js
// Deterministic encryption wrapper for Dummy test coin
//
// [!] Browserify this and save to deterministic.js.lzma to enable sending it from hybridd to the browser!
//

var wrapper = (
  function() {

    var functions = {
      // create deterministic public and private keys based on a seed
      keys : function(data) {
        return { dummy:'dummy' };
      },

      // generate a unique wallet address from a given public key
      address : function(data) {
        return '_dummyaddress_';
      },

      transaction : function(data, callback) {
        callback('_dummytransaction_');
      }
    }

    return functions;
  }
)();

// export the functionality to a pre-prepared var
deterministic = wrapper;
