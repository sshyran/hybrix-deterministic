// (C) 2017 Internet of Coins / Metasync / Joachim de Koning
// hybridd module - ethereum/deterministic.js
// Deterministic encryption wrapper for Ethereum
//
// [!] Browserify this and save to deterministic.js.lzma to enable sending it from hybridd to the browser!
//

var wrapper = (
	function() {

		var functions = {
			// create deterministic public and private keys based on a seed
			keys : function(data) {
        var privateKey = wrapperlib.ethUtil.sha256(data.seed);
				// return object { privateKey:binary_privkey }
        return {privateKey:privateKey};
			},

      // generate a unique wallet address from a given public key
      address : function(data) {
        var publicKey = wrapperlib.ethUtil.privateToPublic(data.privateKey);
        return '0x'+wrapperlib.ethUtil.publicToAddress(publicKey).toString('hex');
      },

			transaction : function(data) {
        // set the parameters
        var txParams = {    // optional-> data: payloadData
          nonce: '0x'+parseInt(data.unspent.nonce).toString(16), // nonce
          gasPrice: '0x'+parseInt(data.fee/21000).toString(16),   // we use toString(16) here to specify HEX radix
          gasLimit: '0x'+parseInt(21000).toString(16),       //  but don't use it elsewhere
          to: data.target, 
          value: '0x'+parseInt(data.amount).toString(16)
        };
        // DEBUG: logger(JSON.stringify(txParams));

        // Transaction is created
        var tx = new wrapperlib.ethTx(txParams);

        // Transaction is signed
        tx.sign(data.keys.privateKey);
        var serializedTx = tx.serialize();
        var rawTx = '0x' + serializedTx.toString('hex');
        // DEBUG: logger('rawTx: '+rawTx);

				return rawTx;
			},

      // encode ABI smart contract calls
      encode : function(data) {
        return '0x'+wrapperlib.ethABI.simpleEncode(data.func,data.address).toString('hex');
        // more complex is possible: var encoded = abi.encode(tokenAbi, "balanceOf(uint256 address)", [ "0x0000000000000000000000000000000000000000" ])
      }      

		}

		return functions;
	}
)();

// export the functionality to a pre-prepared var
deterministic = wrapper;
