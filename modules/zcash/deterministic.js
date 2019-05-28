// (C) 2019 Internet of Coins
// hybrixd module - electrum/deterministic_source.js
// Deterministic encryption wrapper for ZCash

const bitcore = require('bitcore-lib-zcash');
const livenet = bitcore.Networks.livenet;

const wrapper = {

  // create deterministic public and private keys based on a seed
  keys: function (data) {
    const buffer = Buffer.from(data.seed, 'utf8');
    const seedBuffer = bitcore.crypto.Hash.sha256(buffer);
    const bn = bitcore.crypto.BN.fromBuffer(seedBuffer);
    const privKey = new bitcore.PrivateKey(bn);
    const pubKey = privKey.toPublicKey();
    const wif = privKey.toWIF();

    return { privKey: privKey, pubKey: pubKey, WIF: wif };
  },

  // generate a unique wallet address from a given public key
  address: function (data) {
    let privKey = bitcore.PrivateKey.fromWIF(data.WIF);
    let publicKey = privKey.toPublicKey();
    let addressObject = publicKey.toAddress(livenet);
    let address = new bitcore.Address(addressObject).toString();
    return address;
  },

  // return public key
  publickey: function (data) {
    return data.pubKey.toString();
  },

  // return private key
  privatekey: function (data) {
    return data.privKey.toString();
  },

  transaction: function (data) {
    let fee = parseFloat(data.fee) * 100000000;
    const hasValidMessage = data.message !== undefined && data.message !== null && data.message !== '';
    const memos = hasValidMessage ? [{data: data.message}] : null;

    let tx = new bitcore.Transaction()
      .from(data.unspent.unspents.map(function (utxo) {
        return {
          txId: utxo.txid,
          outputIndex: parseInt(utxo.txn),
          address: data.source,
          script: utxo.script,
          satoshis: parseInt(utxo.amount)
        };
      }))
      .to(data.target, parseInt(data.amount))
      .change(data.source)
      .fee(fee);

    if (memos) {
      tx.addData(memos);
    }

    tx.sign(data.keys.privKey);

    return tx.serialize();
  }
};

// export the functionality to a pre-prepared var
window.deterministic = wrapper;
