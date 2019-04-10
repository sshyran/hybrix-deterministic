// (C) 2015 Internet of Coins / Metasync / Joachim de Koning
// hybrixd module - dummycoin/deterministic.js
// Deterministic encryption wrapper for Dummy test coin
//
// [!] Browserify this and save to deterministic.js.lzma to enable sending it from hybrixd to the browser!
//
let wrapperlib = require('./wrapperlib');

let wrapper = (
  function () {
    let functions = {
      // create deterministic public and private keys based on a seed
      keys: data => {
        return wrapperlib.keys(data);
      },

      importKeys: data => {
        return {public: data.privateKey, private: data.privateKey};
      },

      // generate a unique wallet address from a given public key
      address: data => {
        return wrapperlib.address(data);
      },

      // return public key
      publickey: data => {
        return wrapperlib.publickey(data);
      },

      // return private key
      privatekey: data => {
        return wrapperlib.privatekey(data);
      },

      // generate a transaction
      transaction: (data, callback) => {
        return wrapperlib.transaction(data, callback);
      }
    };

    return functions;
  }
)();

// export the functionality to a pre-prepared var
window.deterministic = wrapper;
