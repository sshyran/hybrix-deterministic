// (C) 2015 Internet of Coins / Metasync / Joachim de Koning
// hybrixd module - electrum/deterministic_source.js
// Deterministic encryption wrapper for Bitcoin
//
// [!] Browserify this and save to deterministic.js.lzma to enable sending it from hybrixd to the browser!
//
let wrapperlib = require('./wrapperlib');

let wrapper = (
  function () {
    let base58 = require('bs58');
    let ecurve = require('ecurve');
    let BigInteger = require('bigi');
    // DISABLED INSIDE wrapper FUNCTION: var wrapperlib = require('bitcoinjs-lib');

    function setNetwork (data) {
      let network = 'bitcoin';
      if (
        data.mode === 'bitcoincash'
      ) {
        return '[UNDER MAINTENANCE]';
      } else if (
        data.mode === 'counterparty' ||
          data.mode === 'omni'
      ) {
        network = 'bitcoin';
      } else {
        network = data.mode;
      }
      return network;
    }

    let functions = {

      importKeys: function (data) {
        return {WIF: data.privateKey};
      },

      // create deterministic public and private keys based on a seed
      keys: function (data) {
        let network = setNetwork(data);
        let hash = wrapperlib.crypto.sha256(data.seed);
        let privk = BigInteger.fromBuffer(hash);
        let pubk = null;
        let keyPair;
        if (network === 'bitcoin') {
          keyPair = new wrapperlib.ECPair(privk); // backwards compatibility for BTC
        } else {
          keyPair = new wrapperlib.ECPair(privk, pubk, {
            compressed: false,
            network: wrapperlib.networks[network]
          });
        }
        let WIF = keyPair.toWIF();
        return {WIF};
      },

      // generate a unique wallet address from a given public key
      address: function (data) {
        let network = setNetwork(data);
        let keyPair = wrapperlib.ECPair.fromWIF(data.WIF, wrapperlib.networks[network]);
        return keyPair.getAddress();
      },

      // return public key
      publickey: function (data) {
        let network = setNetwork(data);
        let keyPair = wrapperlib.ECPair.fromWIF(data.WIF, wrapperlib.networks[network]);
        return keyPair.getPublicKeyBuffer().toString('hex');
      },

      // return private key
      privatekey: function (data) {
        return data.WIF;
      },

      transaction: function (data) {
        // return deterministic transaction data
        let network = setNetwork(data);
        let keyPair = wrapperlib.ECPair.fromWIF(data.keys.WIF, wrapperlib.networks[network]);
        let tx = new wrapperlib.TransactionBuilder(wrapperlib.networks[network]);

        // for Counterparty or Omni, add OP_RETURN message
        if (data.mode === 'counterparty' || data.mode === 'omni') {
          const MIN_REQUIRED = 546;
          const MAX_OP_RETURN = 80;

          // prepare raw transaction inputs
          let inamount = 0;
          for (let i in data.unspent.unspents) {
            let input = data.unspent.unspents[i];
            let hash = Buffer.from(input.txid.match(/.{2}/g).reverse().join(''), 'hex');
            tx.addInput(hash, input.txn);
            inamount += input.amount;
          }
          if (inamount < MIN_REQUIRED) throw new Error('Insufficient funds');

          // in case of Counterparty or Omni, add destination output
          if (data.target && typeof data.target === 'string') {
            const dest = {
              address: data.target,
              value: MIN_REQUIRED
            };
            tx.addOutput(wrapperlib.address.toOutputScript(dest.address, wrapperlib.networks[network]), dest.value);
          }

          // create and add message
          let encoded;
          if (data.mode === 'counterparty') {
            const CounterJS = require('./CounterJS');

            // create Send
            let scripthex = CounterJS.Message.createSend(
              CounterJS.util.assetNameToId(data.contract),
              parseInt(data.amount)
            );
            // encrypt/encode
            encoded = scripthex.toEncrypted(data.unspent.unspents[0].txid, true);
          } else if (data.mode === 'omni') {
            const omniSend = require('./omni-simple-send');

            // create encoded Send
            encoded = omniSend(parseInt(data.contract), parseInt(data.amount));
          }

          // add OP_RETURN
          for (let bytesWrote = 0; bytesWrote < encoded.length; bytesWrote += MAX_OP_RETURN) {
            tx.addOutput(wrapperlib.script.nullData.output.encode(encoded.slice(bytesWrote, bytesWrote + MAX_OP_RETURN)), 0);
          }

          // send back change
          let outchange = parseInt(data.unspent.change) - MIN_REQUIRED; // fee is already being deducted when calculating unspents
          if (outchange < 0) { outchange = 0; }
          tx.addOutput(wrapperlib.address.toOutputScript(data.source, wrapperlib.networks[network]), outchange);
        } else {
          // add inputs
          for (let i in data.unspent.unspents) {
            tx.addInput(data.unspent.unspents[i].txid, parseInt(data.unspent.unspents[i].txn));
          }

          // add spend amount output
          tx.addOutput(data.target, parseInt(data.amount));

          // send back change
          let outchange = parseInt(data.unspent.change); // fee is already being deducted when calculating unspents
          if (outchange > 0) { tx.addOutput(data.source, outchange); }
        }

        // sign inputs
        for (let i in data.unspent.unspents) {
          tx.sign(parseInt(i), keyPair);
        }

        return tx.build().toHex();
      }
    };

    return functions;
  }
)();

// export the functionality to a pre-prepared var
window.deterministic = wrapper;
