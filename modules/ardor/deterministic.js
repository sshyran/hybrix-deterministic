// (C) 2015 Internet of Coins / Metasync / Joachim de Koning
// hybrixd module - ark/deterministic.js
// Deterministic encryption wrapper for Ark
//
// [!] Browserify this and save to deterministic.js.lzma to enable sending it from hybrixd to the browser!
//

const ardor = require('./ardorjs');

window.ardor = ardor;

const wrapper = {
  // create deterministic public and private keys based on a seed
  keys: data => {
    const publicKey = ardor.secretPhraseToPublicKey(data.seed);
    // simply pass the unique seed as secret phrase to the NXT library
    return {
      publicKey: publicKey,
      secretPhrase: data.seed
    };
  },

  // generate a unique wallet address from a given public key
  address: data => {
    const address = ardor.publicKeyToAccountId(data.publicKey);
    return address;
  },

  // return public key
  publickey: data => {
    return data.publicKey;
  },

  // return private key
  privatekey: data => {
    return data.privateKey;
  },
  // return deterministic transaction data
  transaction: data => {
    if (typeof data.unspent.unsignedTransactionBytes !== 'undefined') {
      return ardor.signTransactionBytes(data.unspent.unsignedTransactionBytes, data.keys.secretPhrase);
    } else {
      return null;
    }
  }
};

// export the functionality to a pre-prepared var
window.deterministic = wrapper;
