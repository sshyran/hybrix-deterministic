const lib = require('bitcore-lib-cash');
const cashaddrjs = require('cashaddrjs');
const bchaddr = require('bchaddrjs');

window.bch = lib;
window.cashAddr = cashaddrjs;

function mkPrivateKey (seed) {
  const seedBuffer = Buffer.from(seed, 'utf8');
  const hash = nacl.to_hex(nacl.crypto_hash_sha256(seedBuffer));
  const bn = lib.crypto.BN.fromBuffer(hash);

  return new lib.PrivateKey(bn);
}

function mkAddress (pk) {
  const address = pk.toAddress();
  const type = address.type === lib.Address.PayToPublicKeyHash ? 'P2PKH' : 'P2SH';
  const hash = new Uint8Array(address.hashBuffer);

  return cashaddrjs.encode('bitcoincash', type, hash);
}

function mkUtxo (utxoData) {
  return function (utxo, i) {
    const txData = {
      address: utxoData.cashAddress,
      outputIndex: i,
      script: utxoData.scriptPubKey
    };
    return Object.assign(utxo, txData);
  };
}

let wrapper = (
  function () {
    return {
      importKeys: data => {
        console.log('data = ', data);
        // return {WIF: data.privateKey};
      },

      // create deterministic public and private keys based on a seed
      keys: data => {
        const pk = mkPrivateKey(data.seed);

        return {
          privateKey: pk
        };
      },

      // generate a unique wallet address from a given public key
      address: data => {
        return mkAddress(data.privateKey);
      },

      // return public key
      publickey: data => {
        return null;
      },

      // return private key
      privatekey: data => {
        return data.privateKey;
      },

      transaction: (data, cb, err) => {
        const targetAddr = data.target;
        const toAddress = bchaddr.isLegacyAddress(targetAddr) ? bchaddr.toCashAddress(targetAddr) : targetAddr;
        const utxoUrl = `https://rest.bitcoin.com/v2/address/utxo/${data.source}`;
        const DEFAULT_FEE = 5430;

        fetch(utxoUrl)
          .then(res => res.json()
            .then(utxoData => {
              const hasValidMessage = data.msg !== undefined &&
                    data.msg !== null &&
                    data !== '';
              const utxos = utxoData.utxos
                .map(mkUtxo(utxoData));
              const transaction = new lib.Transaction()
                .from(utxos)
                .to(toAddress, Number(data.amount))
                .change(data.source);
              const transactionWithMsgOrDefault = hasValidMessage
                ? transaction.addData(data.msg)
                : transaction;
              const signedTransaction = transactionWithMsgOrDefault
                .fee(DEFAULT_FEE)
                .sign(data.keys.privateKey)
                .serialize();

              cb(signedTransaction);
            })
            .catch(err))
          .catch(err);
      }
    };
  }
)();

window.deterministic = wrapper;
