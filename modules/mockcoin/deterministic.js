// (C) 2019 Internet of Coins / Rouke Pouw
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

      importPublic: data => {
        return {public: data.publicKey};
      },

      sumKeys: data => {
        const result = {};
        result.public = data.keys.reduce((sum, keyPair) => sum + Number(keyPair.public), 0) % 1000;
        result.private = data.keys.reduce((sum, keyPair) => sum + Number(keyPair.private), 0) % 1000;
        return result;
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
