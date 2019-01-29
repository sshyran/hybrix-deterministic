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
        console.log("data  keys = ", data);
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
        var hash = nacl.to_hex(nacl.crypto_hash_sha256(data.seed));
        var secret = Buffer.from(hash.substr(0,32), 'hex');
        // It can encode a Buffer
        var encoded = api2.encodeSeed(secret);
        return rippleKeyPairs.deriveKeypair(encoded);
      },

      // generate a unique wallet address from a given public key
      address : data => {
        console.log("data  address = ", data);
        // console.log("data address = ", data);
        return rippleKeyPairs.deriveAddress(data.publicKey);
      },

      // return public key
      publickey : data => {
        console.log("data pubkey = ", data);
        return data.publicKey;
      },

      // return private key
      privatekey : data => {
        console.log("data privkey = ", data);
        return data.privateKey;
      },

      // generate a transaction
      transaction : (data, callback) => {
        const txJSON = '{"source":{"address": "' + rippleKeyPairs.deriveAddress(data.publicKey) + '","amount": {"value": "0.01","currency": "drops"}},"destination": {"address": "rpZc4mVfWUif9CRoHRKKcmhu1nx2xktxBo","amount": {"value": "0.01","currency": "drops","counterparty": "rMH4UxPrbuMa1spCBR98hLLyNJp4d8p4tM"}}}';
const secret = 'shsWGZcmZz6YsWWmcnpfr6fLTdtFV';
const keypair = { privateKey: '00ACCD3309DB14D1A4FC9B1DAE608031F4408C85C73EE05E035B7DC8B25840107A', publicKey: '02F89EAEC7667B30F33D0687BBA86C3FE2A08CCA40A9186C5BDE2DAA6FA97A37D8' };
return api.sign(txJSON, secret); // or: api.sign(txJSON, keypair);
        console.log("callback = ", callback);
        console.log("data = ", data);
        // return undefined;//
        // return api.transaction(data,callback);
      }
    };

window.deterministic = wrapper;
