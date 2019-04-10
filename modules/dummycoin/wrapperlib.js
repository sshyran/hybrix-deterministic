//
// wrapperlib to include libraries for incorporation into the virtual DOM
//

// inclusion of necessary requires
let dummylib = {

  // create deterministic public and private keys based on a seed
  keys: data => {
    return {public: '_dummypublickey_', private: '_dummyprivatekey_'};
  },

  // generate a unique wallet address from a given public key
  address: data => {
    if (typeof data === 'object' && data.public === '_dummypublickey_' && data.private === '_dummyprivatekey_') {
      return '_dummyaddress_';
    } else {
      throw 'Expected correct keys.';
    }
  },

  publickey: data => {
    if (typeof data === 'object' && data.public === '_dummypublickey_' && data.private === '_dummyprivatekey_') {
      return '_dummypublickey_';
    } else {
      throw 'Expected correct keys.';
    }
  },

  privatekey: data => {
    if (typeof data === 'object' && data.public === '_dummypublickey_' && data.private === '_dummyprivatekey_') {
      return '_dummyprivatekey_';
    } else {
      throw 'Expected correct keys.';
    }
  },

  transaction: function (data, callback) {
    const txStr = '_dummytransaction_' + data.amount + '_' + data.fee;
    callback(txStr);
  }

//  dummyfy : require('./bitcore-lib'),
};

module.exports = dummylib;
