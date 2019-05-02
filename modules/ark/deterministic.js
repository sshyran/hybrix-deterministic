// (C) 2015 Internet of Coins / Metasync / Joachim de Koning
// hybrixd module - ark/deterministic.js
// Deterministic encryption wrapper for Ark
//
// [!] Browserify this and save to deterministic.js.lzma to enable sending it from hybrixd to the browser!
//

let wrapperlib = require('./ark-js-mod/index');

let wrapper = {
  // create deterministic public and private keys based on a seed
  keys: data => {
    // return object { publicKey:'', privateKey:'' }
    return wrapperlib.crypto.getKeys(data.seed);
  },

  // TODO importPrivate
  // TODO importPublic
  // TODO sumKeys

  // generate a unique wallet address from a given public key
  address: data => {
    return wrapperlib.crypto.getAddress(data.publicKey);
  },

  // return public key
  publickey: data => {
    return data.publicKey;
  },

  // return private key
  privatekey: data => {
    return data.d.toBuffer().toString('hex');
  },

  transaction: data => {
    // return deterministic transaction data
    return JSON.stringify(wrapperlib.transaction.createTransaction(data.target, parseInt(data.amount), null, data.seed));
    // for more information see: https://github.com/corsaro1/lisk_broadcast
  }
};

// export the functionality to a pre-prepared var
window.deterministic = wrapper;
