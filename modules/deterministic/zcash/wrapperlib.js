//
// wrapperlib to include libraries for incorporation into the virtual DOM
//


// inclusion of necessary requires
var zcashbitcorelib = {
  zcash : require('zcash-bitcore-lib'),
  zcashjs: require('./zcash-bitcoinjs')
}

module.exports = zcashbitcorelib;
