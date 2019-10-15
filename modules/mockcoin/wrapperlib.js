//
// wrapperlib to include libraries for incorporation into the virtual DOM
//

// inclusion of necessary requires
let dummylib = {

  // create deterministic public and private keys based on a seed
  keys: function (data) {
    const key = (data.seed.charCodeAt(0) * 3 + data.seed.charCodeAt(5) * 11 + data.seed.charCodeAt(3) * 101 + data.seed.charCodeAt(2) * 1323) % 997;
    return {public: key.toString(), private: key.toString()};
  },

  // generate a unique wallet address from a given public key
  address: function (data) {
    return data.public.toString();
  },

  publickey: function (data) {
    return data.public.toString();
  },

  privatekey: function (data) {
    return data.private.toString();
  },

  transaction: function (data, callback) {
    const source = data.source;
    if (data.keys.public !== source) {
      throw ('Illegal keys.');
    } else {
      const target = data.target;
      const contract = data.contract;
      const amount = data.amount;
      const fee = data.fee;
      const message = typeof data.message === 'string' ? data.message : '';
      const signature = Number(source) * Number(target) + Number(amount) + Number(fee) * 3.14 + contract.length * 1001 + message.length * 123;
      const newTransaction = {source, target, contract, amount, fee, signature, message};
      callback(JSON.stringify(newTransaction));
    }
  }

};

module.exports = dummylib;
