// (C) 2018 Internet of Coins / Gijs-Jan van Dompseler / Joachim de Koning
// Deterministic encryption wrapper for Stellar

'use strict';

const StellarSdk = require('stellar-sdk');

const wrapper = (
  function () {
    const functions = {
      // create deterministic public and private keys based on a seed
      // https://stellar.github.io/js-stellar-sdk/Keypair.html
      keys : function(data) {
        const seed = Buffer.from(data.seed, 'utf8');
        const hash = window.nacl.to_hex(window.nacl.crypto_hash_sha256(seed));
        const secret = Buffer.from(hash.substr(0,32), 'utf8');
        const keyPair = StellarSdk.Keypair.fromRawEd25519Seed(secret);
        return {publicKey: keyPair.publicKey(), privateKey: keyPair.secret()};
      },

      // generate a unique wallet address from a given public key
      address : function(data) {
        return data.publicKey;
      },

      // return public key
      publickey : function(data) {
        return data.publicKey;
      },

      // return private key
      privatekey : function(data) {
        return data.privateKey;
      },

      transaction: function(data, callback, errorCallback){
        const sequence = data.unspent;

        // the Stellar network requires that an account is funded with at least 1 XLM
        // in order to be able to use the API.
        // if this is not the case, the API will return HTTP 404 Not Found
        // and the 'unspent' field will be null
        if(sequence === undefined) {
            const message = `Expected unspent to be a positive integer string, e.g. "998719879287873". Check the value and check if the Stellar account ${data.source_address} balance is below 1 XLM.`;
            errorCallback(message);
        }

        const source = new StellarSdk.Account(data.source, sequence);
        StellarSdk.Network.usePublicNetwork();

        const transaction = new StellarSdk.TransactionBuilder(source)
            .addOperation(StellarSdk.Operation.payment({
              destination: data.target,
              amount: String(data.amount),
              asset: StellarSdk.Asset.native()
            }))
            .build();
        const keyPair = StellarSdk.Keypair.fromSecret(data.keys.privateKey);

        transaction.sign(keyPair);
        return transaction.toEnvelope().toXDR('base64').replace(/\//g, '*');
      }
    };
    return functions;
  }
)();

// export the functionality to a pre-prepared const
window.deterministic = wrapper;
