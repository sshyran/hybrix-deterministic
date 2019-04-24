// (C) 2017 Internet of Coins / Joachim de Koning
// Deterministic encryption wrapper for Ethereum

let wrapperlib = require('./wrapperlib');

let wrapper = (
  function () {
    // encode ABI smart contract calls
    // call it by explicitly specifying the variables you want to pass along
    //
    // EXAMPLES:
    //            encode({ 'func':'balanceOf(address):(uint256)', 'vars':['target'], 'target':data.target });
    //            encode({ 'func':'transfer(address,uint256):(uint256)', 'vars':['target','amount'], 'target':data.target,'amount':parseLargeIntToHex(data.amount).toString('hex') });
    function encode (data) {
      return '0x' + (new Function('wrapperlib', 'data', 'return wrapperlib.ethABI.simpleEncode(data.func,data.' + data.vars.join(',data.') + ');'))(wrapperlib, data).toString('hex');
    }

    function parseLargeIntToHex (input) {
      let result = wrapperlib.hex2dec.toHex(new Decimal(String(input)).toInteger().toFixed(64).replace(/\.?0+$/, ''));
      return result !== null ? result : '0x0';
      // DEPRECATED: return new Decimal(String(input)).toInteger().toFixed(64).replace(/\.?0+$/,"");
    }

    let functions = {

      // create deterministic public and private keys based on a seed
      keys: function (data) {
        let privateKey = wrapperlib.ethUtil.sha256(data.seed);
        return {privateKey: privateKey};
      },

      importKeys: function (data) {
        return {privateKey: Buffer.from(data.privateKey, 'hex')};
      },

      // generate a unique wallet address from a given public key
      address: function (data) {
        let publicKey = wrapperlib.ethUtil.privateToPublic(data.privateKey);
        return '0x' + wrapperlib.ethUtil.publicToAddress(publicKey).toString('hex');
      },

      // return public key
      publickey: function (data) {
        let publicKey = wrapperlib.ethUtil.privateToPublic(data.privateKey);
        return publicKey.toString('hex');
      },

      // return private key
      privatekey: function (data) {
        return data.privateKey.toString('hex');
      },

      // create and sign a transaction
      transaction: function (data) {
        const hasValidMessage = typeof data.message !== 'undefined' && data.message !== null && data.message !== '';
        let txParams;
        if (data.mode !== 'token') {
          // Base ETH mode
          txParams = { // optional-> data: payloadData
            nonce: parseLargeIntToHex(data.unspent.nonce), // nonce
            gasPrice: parseLargeIntToHex(data.fee / 21000), // we use toString(16) here to specify HEX radix
            gasLimit: parseLargeIntToHex(21000), //  but don't use it elsewhere
            to: data.target, // send it to ...
            value: parseLargeIntToHex(data.amount) // the amount to send
          };

          if (hasValidMessage) {
            txParams.data = data.message;
          }
        } else {
          let tokenfeeMultiply = 16; // [!] must be same as the value in back-end module
          // ERC20-compatible token mode
          const encoded = encode({ 'func': 'transfer(address,uint256):(bool)', 'vars': ['target', 'amount'], 'target': data.target, 'amount': parseLargeIntToHex(data.amount) }); // returns the encoded binary (as a Buffer) data to be sent
          txParams = {
            nonce: parseLargeIntToHex(data.unspent.nonce), // nonce
            gasPrice: parseLargeIntToHex(new Decimal(String(data.fee)).dividedBy(21000 * tokenfeeMultiply).times(2).toString()), // must be 2x normal tx!
            gasLimit: parseLargeIntToHex(new Decimal(String(21000 * tokenfeeMultiply)).dividedBy(2).toString()), // should not exceed 300000 !
            to: data.contract, // send payload to contract address
            value: '0x0', // set to zero, since we're sending tokens
            data: encoded // payload as encoded using the smart contract
          };
        }

        // DEBUG: return JSON.stringify(txParams);

        // Transaction is created
        const tx = new wrapperlib.EthTx(txParams);

        // Transaction is signed
        tx.sign(data.keys.privateKey);
        const serializedTx = tx.serialize();
        const rawTx = '0x' + serializedTx.toString('hex');
        return String(rawTx);
      },
      // encode ABI smart contract calls
      encode: function (data) { return encode(data); }

    };
    return functions;
  }
)();

// export functionality to a pre-prepared var
window.deterministic = wrapper;
