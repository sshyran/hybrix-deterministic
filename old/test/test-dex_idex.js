/*
 * Example to test a deterministic wrapper
 */
request = require('request');
fs = require('fs');
nacl = require('./lib/crypto/nacl');
crypto = require('crypto');                   // this supersedes browserify crypto library when code is run in virtual DOM
LZString = require('./lib/crypto/lz-string');
//Decimal = require('./lib/crypto/decimal-light'); Decimal.set({ precision: 64 });  // high precision for nonces
//UrlBase64 = require('./crypto/urlbase64');
jsdom = require('jsdom');

//
// first some most often used global functions
//

// we use function 'logger' server-side and browser-side, enabling us to adapt its functionality
logger = function(text) {
  console.log("\n"+text);
}

// easy conversion from Decimal.js integer
fromInt = function(input,factor) {
  f = Number(factor);
  x = new Decimal(String(input));
  return x.times((f>1?'0.'+new Array(f).join('0'):'')+'1');
}

Number.prototype.toFixedSpecial = function(n) {
};

// easy conversion to Decimal.js integer
toInt = function(input,factor) {
  f = Number(factor);
  x = new Decimal(String(input));
  return x.times('1'+(f>1?new Array(f+1).join('0'):''));
}

//
// first we read from the compiled package and activate the code
//

dcode = String(fs.readFileSync('./modules/deterministic/dex_idex/deterministic.js.lzma'))
//require(LZString.decompressFromEncodedURIComponent(dcode));
var deterministic = activate( LZString.decompressFromEncodedURIComponent(dcode) );

// 000000000000000000

// ./hybrixd /asset/eth.kin/details
var kin_token = {"symbol":"eth.kin"
                  ,"name":"Kin"
                  ,"mode":"ethereum.token"
                  ,"fee":"0.000207060000000000"
                  ,"contract":"0x818Fc6C2Ec5986bc6E2CBf00939d90556aB12ce5"
                  ,"factor":"18"
                  ,"keygen-base":"eth"
                  ,"fee-symbol":"eth"};

var input = { token: kin_token
            , amountToken: "25000000000000000000" // 25 MET
            , amountETH:    "1000000000000000000" // 1 ETH
            , isBuyOrder: false
            , nonce: 17
            , address: "0x547Ccc7fB09bD73BB7272ea9687903751C6D3ef0"
            , privateKey: "ff22d263ef05ae0a481b57300ecebfcde07c33146751bcf90e06343b5bac966c"
             }


if(typeof deterministic!='object' || deterministic=={}) {
  logger('Error: Cannot load deterministic wrapper!');
} else {

  //
  // generate cryptographic keys based on a seed string
  //
  /*input = { seed: tx[mode].seed }
  var result = deterministic.keys(input);
  tx[mode].keys = result;
  logger('SEED: '+input.seed);*/

  //
  // produce a public address based on cryptographic keys
  //
  /*var result = deterministic.address(tx[mode].keys);
  tx[mode].source_address = result;
  logger('PUBLIC ADDRESS: '+result);*/

  //
  // produce a public address based on cryptographic keys
  //
  /* logger('CONTRACT ADDRESS: '+tx[mode].contract); */

  //
  // create a signed transaction
  //

  //logger('TRANSACTION INPUT: '+JSON.stringify(input));
  
  var orderType = 'order';
  var pushToAPI = false
  if(orderType == 'order')
  {
    /*var signedOrderReference = makeOrderJSONMessage("0x2a0c0dbecc7e4d658f48e01e3fa353f44050c208", // contract address
                                                      "0x0000000000000000000000000000000000000000", // tokenBuy
                                                      input.amountETH,                              // amountBuy
                                                      input.tokenAddress,                           // tokenSell
                                                      input.amountToken,                            // amountSell
                                                      1,                                            // expires
                                                      input.nonce,                                  // nonce
                                                      input.address,                                // address
                                                      input.privateKey)                             // privateKey*/
    //logger('SIGNED TRANSACTION REFERENCE: ')
    //console.dir(signedOrderReference, {depth: null});
      
    logger('SIGNED TRANSACTION DETERMINISTIC: ');
    var signedOrder = deterministic.makeSignedIdexOrder(input);
    console.log(JSON.stringify(signedOrder));
    
    if(pushToAPI)
    {
      idexPostRequest("order", signedOrder, console.log);
    }
  }
  if (orderType == 'cancel') {
  
    cancelInput = { orderHashToCancel: "0x86f81a2591cb731f00d81305da1e9cf70bfa45882343d9ea232d4e4172a7317e",
                    nonce: input.nonce+1,
                    address: input.address,
                    privateKey: input.privateKey};
    var signedCancelOrder = deterministic.cancelSignedIdexOrder(cancelInput)
    logger('SIGNED CANCEL ORDER: ')
    console.log(JSON.stringify(signedCancelOrder));
      
    if(pushToAPI)
    {
      idexPostRequest("cancel", signedCancelOrder, console.log);
    }
  }
  if (orderType == 'withdrawal') {
    ETHAddress = "0x0000000000000000000000000000000000000000"
    withdrawalInput = { token: ETHAddress,
                        amount: '221350000000000000',
                        nonce: input.nonce,
                        address: input.address,
                        privateKey: input.privateKey }
                        
    var signedWithdrawalOrder = deterministic.SignedIdexWithdrawal(withdrawalInput)
    logger('SIGNED WITHDRAWAL ORDER: ')
    console.log(JSON.stringify(signedWithdrawalOrder));
      
    if(pushToAPI)
    {
      idexPostRequest("withdraw", signedWithdrawalOrder, console.log);
    }
  }
  
}

function idexPostRequest(requestType, jsonArgs, callback) {
  return request({
    method: 'POST',
    url: 'https://api.idex.market/'+requestType,
    json: jsonArgs,
  }, function (err, resp, body) {
    callback(body);
  });
}

// activate (deterministic) code from a string
function activate(code) {
  if(typeof code == 'string') {
    // interpret deterministic library in a virtual DOM environment
    var { JSDOM } = jsdom;
    var dom = (new JSDOM('', { runScripts: "outside-only" })).window;
    dom.window.nacl = nacl; // inject NACL into virtual DOM
    dom.window.crypto = crypto; // inject nodeJS crypto to supersede crypto-browserify
    dom.window.logger = logger; // inject the logger function into virtual DOM
    dom.eval('var deterministic = (function(){})(); '+code+';'); // init deterministic code
    return dom.window.deterministic;
  } else {
    logger('Error: Cannot activate deterministic code!')
    return function(){};
  }
}

function makeOrderJSONMessage(contractAddress, tokenBuy, amountBuy, tokenSell, amountSell, expires, nonce, address, privateKey) {
  
  const privateKeyBuffer  = Buffer.from(privateKey, 'hex');
  
  const { soliditySha3 } = require('web3-utils');
  const {
    hashPersonalMessage,
    bufferToHex,
    toBuffer,
    ecsign
  } = require('ethereumjs-util')
  const { mapValues } = require('lodash');
  const raw = soliditySha3({
    t: 'address',
    v: contractAddress
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
  const salted = hashPersonalMessage(toBuffer(raw))
  const {
    v,
    r,
    s
  } = mapValues(ecsign(salted, privateKeyBuffer), (value, key) => key === 'v' ? value : bufferToHex(value));
  // send v, r, s values in payload
  return {
      "tokenBuy": tokenBuy,
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
}
