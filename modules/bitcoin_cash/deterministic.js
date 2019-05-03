const lib = require('bitcore-lib-cash');
const cashaddrjs = require('cashaddrjs');
const bchaddr = require('bchaddrjs');
const Decimal = require('decimal.js-light');

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

        const hasValidMessage = data.msg !== undefined &&
              data.msg !== null &&
              data !== '';
        const amount = Number(data.amount);
        const factor = Math.pow(10, Number(data.factor));
        const fee = new Decimal(data.fee)
          .times(
            new Decimal(String(factor))
          )
          .toNumber();
        const utxos = data.unspent.unspents.map(mkUtxo(data.source, data.factor), data);
        const transaction = new lib.Transaction()
          .from(utxos)
          .to(toAddress, amount)
          .change(data.source);
        const transactionWithMsgOrDefault = hasValidMessage
          ? transaction.addData(data.msg)
          : transaction;

        const signedTransaction = transactionWithMsgOrDefault
          .fee(fee)
          .sign(data.keys.privateKey)
          .serialize();

        cb(signedTransaction);
      }
    };
  }
)();

function mkUtxo (addr, factor) {
  return function (u) {
    return {
      address: addr,
      outputIndex: u.txn,
      satoshis: new Decimal(u.amount)
        .toNumber(),
      script: u.script,
      txId: u.txid
    };
  };
}

window.deterministic = wrapper;
