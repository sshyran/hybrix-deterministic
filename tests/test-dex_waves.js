/*
 * Example to test a deterministic wrapper
 */

fs = require('fs');
nacl = require('./../common/crypto/nacl');
crypto = require('crypto');                   // this supersedes browserify crypto library when code is run in virtual DOM                   // this supersedes browserify crypto library when code is run in virtual DOM
LZString = require('./../common/crypto/lz-string');
Decimal = require('./../common/crypto/decimal-light'); Decimal.set({ precision: 64 });  // high precision for nonces
//UrlBase64 = require('./crypto/urlbase64');
hex2dec = require('./../common/crypto/hex2dec');
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

// easy conversion to Decimal.js integer
toInt = function(input,factor) {
  f = Number(factor);
  x = new Decimal(String(input));
  return x.times('1'+(f>1?new Array(f+1).join('0'):''));
}


//
// first we read from the compiled package and activate the code
// 

dcode = String(fs.readFileSync('./../modules/dex_waves/deterministic.js.lzma'))
//require(LZString.decompressFromEncodedURIComponent(dcode));
var deterministic = activate( LZString.decompressFromEncodedURIComponent(dcode) );

var wallet_privatekey = '2fLjLognsYGDJbjYtbUCJLgBrcJL8cofddDw3mtEgBhd'
var wallet_publickey = 'DLjqDo5Fhrwe19RXdz2BwLfuLipffqk6queL6VwyH7hi'
var wallet_address = '3P9goYuUuu3wQ2etAes6RyiF1bJL9ZEhpRa'
var matcher_public_key = '7kPFrHDiGw1rCm7LPszuECwWYL3dMf6iMifLRDJQZMzy'
var binaryRandomSeed = "5a779b423782d4d04f06c8b996239e93f340188a05a5e132e0ec9b2cdde00a570c5d2aaee8d5d15dd66ec4e2557ecf17b7c8402fdfba936ee028e3fc54be8a42"
var waves_coin_details = {
                            "fee":"0.00100000",
                            "factor":"8"
                            ,"contract":""
                            ,"symbol":"waves"
                            ,"name":"Waves"
                            ,"mode":"waves"
                            ,"unified-symbols":"undefined"
                            ,"fee-symbol":"waves"
                            ,"keygen-base":"waves"
                            ,"generated":"never"
                          }
                          
var usd_token_details = {
                          "fee":"0.00100000",
                          "factor":"2",
                          "contract":"Ft8X1v1LTa1ABafufpaCWyVj8KkaxUWE6xBhW6sNFJck",
                          "symbol":"waves.usd","name":"USD Token Stablecoin (Waves)",
                          "mode":"waves.token",
                          "unified-symbols":"undefined",
                          "fee-symbol":"waves",
                          "keygen-base":"waves",
                          "generated":"never"
                        }

var input = {
              spendAmount: "0.004",
              receiveAmount: "0.01", 
              spendAsset: waves_coin_details, 
              receiveAsset: usd_token_details, 
              matcherFee: 300000,  //default from python python implementation
              maxLifetime: 3600,  //3600 = 1 hour 
              hexRandomSeed: binaryRandomSeed, 
              matcherPublicKey: matcher_public_key, 
              publickey: wallet_publickey, 
              privKey: wallet_privatekey
            }

if(typeof deterministic!='object' || deterministic=={}) {
  logger('Error: Cannot load deterministic wrapper!');
} else {

  console.dir(input, {depth:null});

  signedOrder = deterministic.makeSignedWavesOrder(input);

  logger(signedOrder)
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
//    dom.window.fetch = deterministic.fetch; // inject the logger function into virtual DOM
    dom.eval('var deterministic = (function(){})(); '+code+';'); // init deterministic code
    return dom.window.deterministic;
  } else {
    logger('Error: Cannot activate deterministic code!')
    return function(){};
  }
}
