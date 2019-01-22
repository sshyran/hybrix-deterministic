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
const api = new RippleAPI();
var BASE58 = '123456789ABCDEFGHJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
var bs58 = require('base-x')(BASE58);
// GL.ripple = api;
// GL.keyPairs = rippleKeyPairs;

    //instantiate Ripple in offline mode for securing keysfrom the ripplenetwork
    var wrapper = {
      // create deterministic public and private keys based on a seed
      keys : data => {
        // console.log("data keys = ", data);
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
            AccountID : {version: 0x00},
            // secrets
            Seed: {version: 0x21}
          }
        });
        var hash = window.nacl.to_hex(nacl.crypto_hash_sha256(data.seed));
        var secret = Buffer.from(hash.substr(0,32), 'hex');
        // It can encode a Buffer
        var encoded = api2.encodeSeed(secret);
        return rippleKeyPairs.deriveKeypair(encoded);
      },

      // generate a unique wallet address from a given public key
      address : data => {
        // console.log("data address = ", data);
        return rippleKeyPairs.deriveAddress(data.publicKey);
      },

      // return public key
      publickey : data => {
        return data.publicKey;
      },

      // return private key
      privatekey : data => {
        return data.privateKey;
      },

      // generate a transaction
      transaction : (data, callback) => {
        return api.transaction(data,callback);
      }
    }

window.deterministic = wrapper;
