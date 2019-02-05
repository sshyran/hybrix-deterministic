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
const testAddress = 'rJX759X9AuXGtqDtEeGJqHBW1tFm6gTL55';
const testSecret = 'shoNrRQMBEux9qmjazZiPHgaUTLHx';

const testAddress2 = 'rfqShznipXZ31WMcSQfh2Ctzw5njGusAhU';
const testSecret2 = 'snSpMnYgYzxppHJncnUNSxXZEwDLh';
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
          sha256: bytes => createHash('sha256').update(new Buffer(bytes)).digest(),
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
        return rippleKeyPairs.deriveKeypair(testSecret);
      },

      // generate a unique wallet address from a given public key
      address : data => {
        console.log("data  address = ", data);
        console.log("address in XRP = ", rippleKeyPairs.deriveAddress(data.publicKey));
        // console.log("data address = ", data);
        const address = rippleKeyPairs.deriveAddress(data.publicKey);
        return address;
      },

      // return public key
      publickey : data => data.publicKey,

      // return private key
      privatekey : data => data.privateKey,

      // generate a transaction
      transaction : (data, callback) => {
        console.log("callback = ", callback);
        console.log("data in tx xrp= ", data);
        const address = data.source;
        const payment = {
          "source": {
            "address": address,
            "maxAmount": {
              "value": data.amount,
              "currency": "drops"
            }
          },
          "destination": {
            "address": data.target,
            "amount": {
              "value": data.amount,
              "currency": "drops"
            }
          }
        };
        console.log("payment = ", payment);
        const alteredFee = parseInt(data.fee);
        const smallerFee = alteredFee / 1000000000000;
        const instructions = {
          "fee": smallerFee.toString(),
          "sequence": parseInt(data.unspent.sequence),
          "maxLedgerVersion": parseInt(data.unspent.lastLedgerSequencePlus)
        };
        const keypair = {
          privateKey: data.keys.privateKey,
          publicKey: data.keys.publicKey
        };
        const tx = api.preparePayment(address, payment, instructions)
              .then(prepared => api.sign(prepared.txJSON, keypair))
              .then(signed2 => {
                console.log('signed2 = ', signed2);
                const sendTx = {
                  id: 3,
                  command: 'submit',
                  tx_blob: signed2.signedTransaction
                };
                return callback(JSON.stringify(sendTx));
              });
      }
    };

window.deterministic = wrapper;
