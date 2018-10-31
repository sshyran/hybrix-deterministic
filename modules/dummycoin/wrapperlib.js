//
// wrapperlib to include libraries for incorporation into the virtual DOM
//



// inclusion of necessary requires
var dummylib = {

    // create deterministic public and private keys based on a seed
    keys : function(data) {
      return { dummy:'dummy' };
    },

  // generate a unique wallet address from a given public key
  address : function(data) {
    if(typeof data === 'object' && data.hasOwnProperty('dummy') && data.dummy === 'dummy'){
      return '_dummyaddress_';
    }else{
      throw('Expected data.dummy === "dummy".');
    }
  },

  publickey : function(data) {
    if(typeof data === 'object' && data.hasOwnProperty('dummy') && data.dummy === 'dummy'){
      return '_dummypublickey_';
    }else{
      throw('Expected data.dummy === "dummy".');
    }
  },

  privatekey : function(data) {
    if(typeof data === 'object' && data.hasOwnProperty('dummy') && data.dummy === 'dummy'){
      return '_dummyprivatekey_';
    }else{
      throw('Expected data.dummy === "dummy".');
    }
  },

  transaction : function(data, callback) {
    callback('_dummytransaction_');
  }

//  dummyfy : require('./bitcore-lib'),
}

module.exports = dummylib;
