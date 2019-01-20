// (C) 2015 Internet of Coins / Metasync / Joachim de Koning
// hybrixd module - dummycoin/deterministic.js
// Deterministic encryption wrapper for Dummy test coin
//
// [!] Browserify this and save to deterministic.js.lzma to enable sending it from hybrixd to the browser!
//
const RippleAPI = require('ripple-lib').RippleAPI;
const rippleKeyPairs = require("ripple-keypairs");
// const apiFactory = require('../');
const apiFactory = require('x-address-codec');
const createHash = require('create-hash');
const hex2base32 = require('./../../common/crypto/hex2base32.js');
const api = new RippleAPI();
var BASE58 = '123456789ABCDEFGHJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
var bs58 = require('base-x')(BASE58);
GL.ripple = api;
GL.keyPairs = rippleKeyPairs;


function makeStringTo16LengthNumber (acc, n, i) {
    if (String(acc).length < 16) {
      return acc + (n * (Math.pow(58, i+1)));
    } else if (String(acc).length > 16) {
      return Number(String(acc).slice(0, 31));
    } else {
      return acc; // === length 32
    }
}

function makeIntoNumber (data) {
  return data.seed
    .split('')
    .map(str => str.charCodeAt(0))
    .reduce(makeStringTo16LengthNumber, 0);
};

    //instantiate Ripple in offline mode for securing keysfrom the ripplenetwork
    var wrapper = {
      // create deterministic public and private keys based on a seed
      keys : data => {
        console.log("data.seed = ", data.seed);
        var api2 = apiFactory({
          // We probably have your favorite alphabet, if not, contact us
          defaultAlphabet: 'ripple',
          // But we insist you bring your own hash to the party :)
          sha256: function(bytes) {
            return createHash('sha256').update(new Buffer(bytes)).digest();
          },
          // We'll endow your api with encode|decode* for you
          codecMethods : {
            // public keys
            // AccountID : {version: 0x00},
            // secrets
            Seed: {version: 0x21}
          }
        });
        const number = makeIntoNumber(data);
        console.log("number = ", number);

        var buf = Buffer.from(number.toString() + number.toString().split('').reverse().join(''), 'hex');

        //'00000000000000000000000000000000'
        console.log("buf = ", buf);
        // It can encode a Buffer
        var encoded = api2.encodeSeed(buf);
        console.log("encoded = ", encoded);
        return rippleKeyPairs.deriveKeypair(encoded);
      },

      // generate a unique wallet address from a given public key
      address : data => {
        console.log("data = ", data);
        console.log("data address = ", rippleKeyPairs.deriveAddress(data.publicKey));
        return rippleKeyPairs.deriveAddress(data.publicKey);
      },

      // return public key
      publickey : data => {
        console.log("data = ", data);
        console.log("data  pubKey= ", data.publicKey);
        return data.publicKey;
      },

      // return private key
      privatekey : data => {
        console.log("data = ", data);
        console.log("data privKey = ", data.privateKey);
        return data.privatekey;
      },

      // generate a transaction
      transaction : (data, callback) => {
        return api.transaction(data,callback);
      }
    }

// const RippleAPI = require('ripple-lib').RippleAPI;

// const api = new RippleAPI({
//   server: 'wss://s1.ripple.com' // Public rippled server hosted by Ripple, Inc.
// });
// api.on('error', (errorCode, errorMessage) => {
//   console.log(errorCode + ': ' + errorMessage);
// });
// api.on('connected', () => {
//   console.log('connected');
// });
// api.on('disconnected', (code) => {
//   // code - [close code](https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent) sent by the server
//   // will be 1000 if this was normal closure
//   console.log('disconnected, code:', code);
// });
// api.connect().then(() => {
//   /* insert code here */
// }).then(() => {
//   return api.disconnect();
// }).catch(console.error);

// export the functionality to a pre-prepared var
//module.exports = wrapper;

window.deterministic = wrapper;
