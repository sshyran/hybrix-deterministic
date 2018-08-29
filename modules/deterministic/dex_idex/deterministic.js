// (C) 2017 Internet of Coins / Joachim de Koning
// hybridd module - ethereum/deterministic.js
// Deterministic encryption wrapper for Ethereum

var wrapperlib = require('./wrapperlib');

var wrapper = (
	function() {
    ETHAddress = "0x0000000000000000000000000000000000000000"
    ETHfactor = 18
    // encode ABI smart contract calls
    // call it by explicitly specifying the variables you want to pass along
    //
    // EXAMPLES:https://aanbod.sshxl.nl/reacties/mijn-reacties
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
    
    function toSatoshi(amount, factor) {
      amount = new Decimal(amount);
      toSatoshiFactor = new Decimal(10);
      toSatoshiFactor = toSatoshiFactor.pow(factor)
      amount = amount.mul(toSatoshiFactor)
      return amount.toString();
    }
    
    function createOrderHash(tokenBuy, amountBuy, tokenSell, amountSell, nonce, address) {
      idexContractAddress = "0x2a0c0dbecc7e4d658f48e01e3fa353f44050c208";
      expires = 1 // expires parameter, is unused by the API but still required to be passed in the call (due to backwards compatibility issues at idex)
      console.log(nonce)
      return wrapperlib.web3utils.soliditySha3({
          t: 'address',
          v: idexContractAddress
        }, {
          t: 'address',
          v: tokenBuy
        }, {
          t: 'uint256',
          v: amountBuy
        }, {
          t: 'address',
          v: tokenSell
        }, {
          t: 'uint256',
          v: amountSell
        }, {
          t: 'uint256',
          v: expires 
        }, {
          t: 'uint256',
          v: nonce
        }, {
          t: 'address',
          v: address
        });
        
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

      makeSignedIdexOrder : function(data) {  // data = { token, amountToken, amountETH, isBuyOrder, nonce, address, privateKey }
        contractAddress = "0x2a0c0dbecc7e4d658f48e01e3fa353f44050c208"  // https://api.idex.market/returnContractAddress
        tokenAddress = data.token.contract
        tokenFactor = data.token.factor
        amountToken = data.amountToken
        amountETH = data.amountETH
        
        amountToken = toSatoshi(amountToken, tokenFactor);
        amountETH = toSatoshi(amountETH, ETHfactor);
        
        if( data.isBuyOrder ) {
          tokenBuy   = tokenAddress
          amountBuy  = amountToken
          tokenSell  = ETHAddress
          amountSell = amountETH
        } else {
          tokenBuy   = ETHAddress
          amountBuy  = amountETH
          tokenSell  = tokenAddress
          amountSell = amountToken
        }
        
        nonce = data.nonce
        address = data.address
        privateKey = data.privateKey.privateKey.toString('hex')
        
        const privateKeyBuffer  = Buffer.from(privateKey, 'hex');
        
        
        const raw = createOrderHash(tokenBuy, amountBuy, tokenSell, amountSell, nonce, address)
        
        const salted = wrapperlib.ethUtil.hashPersonalMessage(wrapperlib.ethUtil.toBuffer(raw))
        const {
          v,
          r,
          s
        } = wrapperlib.lodash.mapValues(wrapperlib.ethUtil.ecsign(salted, privateKeyBuffer), (value, key) => key === 'v' ? value : wrapperlib.ethUtil.bufferToHex(value));
        // send v, r, s values in payload
        return {"tokenBuy": tokenBuy,
                "amountBuy": amountBuy,
                "tokenSell": tokenSell,
                "amountSell": amountSell,
                "address": address,
                "nonce": nonce,
                "expires": expires,
                "v": v,
                "r": r,
                "s": s
                }
      },
      
      cancelSignedIdexOrder : function(data) {  // data = { amountETH, amountToken, isBuyOrder, token, nonceOfOrder, nonce, address, privateKey }
        nonce = data.nonce
        address = data.address
        privateKey = data.privateKey.privateKey.toString('hex')
        tokenAddress = data.token.contract
        tokenFactor = data.token.factor
        
        amountToken = data.amountToken
        amountETH = data.amountETH
        
        amountToken = toSatoshi(amountToken, tokenFactor);
        amountETH = toSatoshi(amountETH, ETHfactor);
        
        if( data.isBuyOrder ) {
          tokenBuy   = tokenAddress
          amountBuy  = amountToken
          tokenSell  = ETHAddress
          amountSell = amountETH
        } else {
          tokenBuy   = ETHAddress
          amountBuy  = amountETH
          tokenSell  = tokenAddress
          amountSell = amountToken
        }
        
        const privateKeyBuffer  = Buffer.from(privateKey, 'hex');
        
        const orderHash = createOrderHash(tokenBuy, amountBuy, tokenSell, amountSell, data.nonceOfOrder, address)
        
        console.log(nonce)
        const raw = wrapperlib.web3utils.soliditySha3({
          t: 'bytes',
          v: orderHash
        }, {
          t: 'uint256',
          v: nonce
        });
        const salted = wrapperlib.ethUtil.hashPersonalMessage(wrapperlib.ethUtil.toBuffer(raw))
        
        const {
          v,
          r,
          s
        } = wrapperlib.lodash.mapValues(wrapperlib.ethUtil.ecsign(salted, privateKeyBuffer), (value, key) => key === 'v' ? value : wrapperlib.ethUtil.bufferToHex(value));
        
        // send v, r, s values in payload
        return {"orderHash": orderHash,
                "address": address,
                "nonce": nonce,
                "v": v,
                "r": r,
                "s": s
                }
      },

      SignedIdexWithdrawal : function(data) {  // data = { token, amount, nonce, address, privateKey }
        contractAddress = "0x2a0c0dbecc7e4d658f48e01e3fa353f44050c208"  // https://api.idex.market/returnContractAddress
        token = data.token.contract
        amount = toSatoshi(data.amount, data.token.factor);
        nonce = data.nonce
        address = data.address
        privateKey = data.privateKey.privateKey.toString('hex')
        
        const privateKeyBuffer  = Buffer.from(privateKey, 'hex');
        const raw = wrapperlib.web3utils.soliditySha3({
          t: 'address',
          v: contractAddress
        }, {
          t: 'address',
          v: token
        }, {
          t: 'uint256',
          v: amount
        }, {
          t: 'address',
          v: address
        }, {
          t: 'uint256',
          v: nonce
        });
        
        const salted = wrapperlib.ethUtil.hashPersonalMessage(wrapperlib.ethUtil.toBuffer(raw))
        const {
          v,
          r,
          s
        } = wrapperlib.lodash.mapValues(wrapperlib.ethUtil.ecsign(salted, privateKeyBuffer), (value, key) => key === 'v' ? value : wrapperlib.ethUtil.bufferToHex(value));
        // send v, r, s values in payload
        return {"address": address,
                "amount": amount,
                "token": token,
                "nonce": nonce,
                "v": v,
                "r": r,
                "s": s
                }
      },
      // encode ABI smart contract calls
      encode : function(data) { return encode(data); }

		}

		return functions;
	}
)();

// export functionality to a pre-prepared var
window.deterministic = wrapper;
