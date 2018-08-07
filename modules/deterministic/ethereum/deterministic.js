// (C) 2017 Internet of Coins / Joachim de Koning
// hybridd module - ethereum/deterministic.js
// Deterministic encryption wrapper for Ethereum

var wrapperlib = require('./wrapperlib');

var wrapper = (
  function() {

    // encode ABI smart contract calls
    // call it by explicitly specifying the variables you want to pass along
    //
    // EXAMPLES:
    //            encode({ 'func':'balanceOf(address):(uint256)', 'vars':['target'], 'target':data.target });
    //            encode({ 'func':'transfer(address,uint256):(uint256)', 'vars':['target','amount'], 'target':data.target,'amount':parseLargeIntToHex(data.amount).toString('hex') });
    function encode(data) {
      return '0x'+( new Function( 'wrapperlib','data', 'return wrapperlib.ethABI.simpleEncode(data.func,data.'+data.vars.join(',data.')+');' ) )(wrapperlib,data).toString('hex');
    }

    function parseLargeIntToHex(input) {
      var result = wrapperlib.hex2dec.toHex( new Decimal(String(input)).toInteger().toFixed(64).replace(/\.?0+$/,"") );
      return result !== null ? result : '0x0';
      // DEPRECATED: return new Decimal(String(input)).toInteger().toFixed(64).replace(/\.?0+$/,"");
    }

    var functions = {

      // create deterministic public and private keys based on a seed
      keys : function(data) {
        var privateKey = wrapperlib.ethUtil.sha256(data.seed);
        return {privateKey:privateKey};
      },

      // generate a unique wallet address from a given public key
      address : function(data) {
        var publicKey = wrapperlib.ethUtil.privateToPublic(data.privateKey);
        return '0x'+wrapperlib.ethUtil.publicToAddress(publicKey).toString('hex');
      },

      // create and sign a transaction
      transaction : function(data) {
        if (data.mode != 'token') {
          // Base ETH mode
          var txParams = {                                               // optional-> data: payloadData
            nonce: parseLargeIntToHex(data.unspent.nonce),  // nonce
            gasPrice: parseLargeIntToHex(data.fee/21000),   // we use toString(16) here to specify HEX radix
            gasLimit: parseLargeIntToHex(21000),            //  but don't use it elsewhere
            to: data.target,                                // send it to ...
            value: parseLargeIntToHex(data.amount)          // the amount to send
          };
        } else {
          var tokenfeeMultiply = 16;   // [!] must be same as the value in back-end module
          // ERC20-compatible token mode
          var encoded = encode({ 'func':'transfer(address,uint256):(bool)','vars':['target','amount'],'target':data.target,'amount':parseLargeIntToHex( data.amount ) }); // returns the encoded binary (as a Buffer) data to be sent
          var txParams = {
            nonce: parseLargeIntToHex(data.unspent.nonce),          // nonce
            gasPrice: parseLargeIntToHex((data.fee/(21000*tokenfeeMultiply))*2),    // must be 2x normal tx!
            gasLimit: parseLargeIntToHex((21000*tokenfeeMultiply)/2),               // should not exceed 300000 !
            to: data.contract,                                      // send payload to contract address
            value: '0x0',                                           // set to zero, since we're sending tokens
            data: encoded                                           // payload as encoded using the smart contract
          };
        }
        // Transaction is created
        var tx = new wrapperlib.ethTx(txParams);

        // Transaction is signed
        tx.sign(data.keys.privateKey);
        var serializedTx = tx.serialize();
        var rawTx = '0x' + serializedTx.toString('hex');
        // DEBUG:         return "\n"+JSON.stringify(txParams)+"\n"+JSON.stringify(txParamsB)+"\n"+JSON.stringify(txParamsC);
        return rawTx;

      },
      // encode ABI smart contract calls
      encode : function(data) { return encode(data); }

    }
  }
)();

// export functionality to a pre-prepared var
window.deterministic = wrapper;
