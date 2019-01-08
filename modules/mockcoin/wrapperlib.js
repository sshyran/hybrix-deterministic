//
// wrapperlib to include libraries for incorporation into the virtual DOM
//



// inclusion of necessary requires
var dummylib = {

    // create deterministic public and private keys based on a seed
  keys : function(data) {
    var key = (data.seed.charCodeAt(0)*3 + data.seed.charCodeAt(5)*11+data.seed.charCodeAt(3)*101 + data.seed.charCodeAt(2)*1323 ) % 997;
      return { public:key, private: key};
    },

  // generate a unique wallet address from a given public key
  address : function(data) {
    return data.public;
  },

  publickey : function(data) {
     return data.public;
  },

  privatekey : function(data) {
    return data.private;
  },

  transaction : function(data, callback) {

    var source = data.source;
    if(data.keys.public!==source){
      throw("Illegal keys.");
    }else{
      var target = data.target;
      var contract = data.contract;
      var amount = data.amount;
      var fee = data.fee;
      var message =  typeof data.message === 'string' ? data.message : '';
      var signature = source * target + amount + fee * 3.14 + contract.length * 1001+ message.length * 123;
      var newTransaction = {source,target,contract,amount,fee,signature, message};
      callback(JSON.stringify(newTransaction));
    }
  }

}

module.exports = dummylib;
