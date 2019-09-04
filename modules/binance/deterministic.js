const bnbCrypto = require('./node_modules/@binance-chain/javascript-sdk/lib/crypto/index.js');
const bnbTx = require('./node_modules/@binance-chain/javascript-sdk/lib/tx/index.js');
const bip39 = require('bip39');
const Big = require('./node_modules/big.js/big.js');

window.bnbCrypto = bnbCrypto;

let wrapper = {
  // create deterministic public and private keys based on a seed
  keys: data => {
    const seed = Buffer.from(data.seed, 'utf8'); // creating long format secret from seed
    const hash = nacl.to_hex(nacl.crypto_hash_sha256(seed));
    const secret = Buffer.from(hash.substr(0, 64), 'hex'); // buffer needs to be max 65
    const mnemonicFromBuffer = bip39.entropyToMnemonic(secret);
    const privateKey = bnbCrypto.getPrivateKeyFromMnemonic(mnemonicFromBuffer); // generation privKey from Mnemonic phrase
    const publicKey = bnbCrypto.getPublicKeyFromPrivateKey(privateKey); // generating pubKey from privKey

    return {pubKey: publicKey, privKey: privateKey};
  },

  importPublic: data => {
    return {publicKey: data.publicKey};
  },

  importPrivate: data => {
    const publicKey = bnbCrypto.getPublicKeyFromPrivateKey(data.privateKey); // generating pubKey from privKey
    return {pubKey: publicKey, privKey: data.privateKey};
  },
  // TODO sumKeys

  // generate a unique wallet address from a given public key
  address: data => {
    const address = bnbCrypto.getAddressFromPublicKey(data.pubKey, 'bnb');
    return address;
  },

  // return public key
  publickey: data => data.pubKey,

  // return private key
  privatekey: data => data.privKey,

  // generate a transaction
  transaction: (data, callback) => {
    const decodedFromAddress = bnbCrypto.decodeAddress(data.source);
    const decodedTargetAddress = bnbCrypto.decodeAddress(data.target);
    const chainID = 'Binance-Chain-Tigris';
    const memo = data.message || '';
    const amount = data.amount;

    const coins = [{
      denom: 'BNB',
      amount: amount
    }];

    const msg = {
      inputs: [{
        address: decodedFromAddress,
        coins
      }],
      outputs: [{
        address: decodedTargetAddress,
        coins
      }],
      msgType: 'MsgSend'
    };
    const signMsg = {
      inputs: [{
        address: data.source,
        coins
      }],
      outputs: [{
        address: data.target,
        coins
      }]
    };

    const options = mkOptions(data.unspent.accountNumber, chainID, memo, msg, data.unspent.sequence, 0, msg.msgType);
    const tx = new bnbTx.default(options);

    return tx
      .sign(data.keys.privKey, signMsg)
      .serialize();
  }
};

function mkOptions (accNo, chainID, memo, msg, seq, source, type) {
  return {
    account_number: parseInt(accNo),
    chain_id: chainID,
    memo,
    msg,
    sequence: parseInt(seq),
    source: source,
    type: type
  };
}

window.deterministic = wrapper;
