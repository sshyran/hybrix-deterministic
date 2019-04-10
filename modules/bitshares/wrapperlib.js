//
// wrapperlib to include libraries for incorporation into the virtual DOM
//

// shim for randomBytes to avoid require('crypto') incompatibilities
// solves bug: "There was an error collecting entropy from the browser

const randomBytes = crypto.randomBytes;
if (typeof window === 'object') {
  const wCrypto = window.crypto || {};
  if (!wCrypto.getRandomValues) {
    wCrypto.getRandomValues = function getRandomValues (arr) {
      const bytes = randomBytes(arr.length);
      for (let i = 0; i < bytes.length; i++) {
        arr[i] = bytes[i];
      }
    };
  }
}

// inclusion of necessary requires
let bitsharesjs = {
  bitshares: require('bitsharesjs'),
  base58: require('bs58')
};

// bitsharesjs.Apis = require('bitsharesjs-ws').Apis;

module.exports = bitsharesjs;
