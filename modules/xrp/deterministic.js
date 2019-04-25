// (C) 2019 Internet of Coins / Jacob Petrovic

const RippleAPI = require('ripple-lib').RippleAPI;
const rippleKeyPairs = require('ripple-keypairs');
const apiFactory = require('x-address-codec');
const createHash = require('create-hash');
const api = new RippleAPI();

// instantiate Ripple in offline mode for securing keysfrom the ripplenetwork
let wrapper = {
  // create deterministic public and private keys based on a seed
  keys: data => {
    let api2 = apiFactory({
      defaultAlphabet: 'ripple',
      sha256: bytes => createHash('sha256').update(Buffer.from(bytes)).digest(),
      codecMethods: {
        AccountID: {version: 0x00},
        Seed: {version: 0x21}
      }
    });
    const seed = Buffer.from(data.seed, 'utf8');
    let hash = nacl.to_hex(nacl.crypto_hash_sha256(seed));
    let secret = Buffer.from(hash.substr(0, 32), 'hex');
    // It can encode a Buffer
    let encoded = api2.encodeSeed(secret);
    return rippleKeyPairs.deriveKeypair(encoded);
  },

  // generate a unique wallet address from a given public key
  address: data => {
    const address = rippleKeyPairs.deriveAddress(data.publicKey);
    return address;
  },

  // return public key
  publickey: data => data.publicKey,

  // return private key
  privatekey: data => data.privateKey,

  // generate a transaction
  transaction: (data, callback) => {
    const address = data.source;
    const currency = data.symbol === 'xrp' ? 'drops' : data.symbol.replace(/XRP./gi, '').toUpperCase();
    const hasValidMessage = data.message !== undefined && data.message !== null && data.message !== '';
    const memos = hasValidMessage ? [{data: data.message}] : [];
    const payment = {
      source: {
        address: address,
        maxAmount: {
          value: data.amount,
          currency
        }
      },
      destination: {
        address: data.target,
        amount: {
          value: data.amount,
          currency
        }
      },
      memos
    };

    const instructions = {
      fee: data.fee,
      sequence: parseInt(data.unspent.sequence),
      maxLedgerVersion: parseInt(data.unspent.lastLedgerSequencePlus)
    };
    const keypair = {
      privateKey: data.keys.privateKey,
      publicKey: data.keys.publicKey
    };
    api.preparePayment(address, payment, instructions)
      .then(prepared => api.sign(prepared.txJSON, keypair))
      .then(signed2 => {
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
