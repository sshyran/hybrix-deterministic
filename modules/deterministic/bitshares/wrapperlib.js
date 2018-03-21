//
// wrapperlib to include libraries for incorporation into the virtual DOM
//

// shim for randomBytes to avoid require('crypto') incompatibilities
// solves bug: "There was an error collecting entropy from the browser

const randomBytes = crypto.randomBytes;
if (typeof window === 'object') {
  const wCrypto = window.crypto = window.crypto || {}
  if (!wCrypto.getRandomValues) {
    wCrypto.getRandomValues = function getRandomValues (arr) {
      const bytes = randomBytes(arr.length)
      for (var i = 0; i < bytes.length; i++) {
        arr[i] = bytes[i]
      }
    }
  }
}

// inclusion of necessary requires
var bitsharesjs = {
  bitshares : require('bitsharesjs')
}

//bitsharesjs.Apis = require('bitsharesjs-ws').Apis;

module.exports = bitsharesjs;
