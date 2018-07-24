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
      return '_dummyaddress_';
    },

    transaction : function(data, callback) {
      callback('_dummytransaction_');
    }

//  dummyfy : require('./bitcore-lib'),
}

module.exports = dummylib;
