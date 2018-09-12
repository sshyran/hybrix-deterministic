/*
 * Example to test a deterministic wrapper
 */

fs = require('fs');
nacl = require('./lib/crypto/nacl');
crypto = require('crypto');                   // this supersedes browserify crypto library when code is run in virtual DOM                   // this supersedes browserify crypto library when code is run in virtual DOM
LZString = require('./lib/crypto/lz-string');
Decimal = require('./lib/crypto/decimal-light'); Decimal.set({ precision: 64 });  // high precision for nonces
//UrlBase64 = require('./crypto/urlbase64');
hex2dec = require('./lib/crypto/hex2dec');
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

var mode = 'waves';  // other modes: bitcoinjslib.bitcoin, ethereum, lisk
dcode = String(fs.readFileSync('./modules/deterministic/'+mode.split('.')[0]+'/deterministic.js.lzma'))
//require(LZString.decompressFromEncodedURIComponent(dcode));
var deterministic = activate( LZString.decompressFromEncodedURIComponent(dcode) );

var input = {}

var tx = {
      'waves': {
        'seed':'correct horse battery staple',                  // seed string for deterministic wallet
        'keys':null,                                            // cryptographic keys (will be generated)
        'source_address':null,                                  // where to transact from (will be generated)
        'target_address':'3PLBy8VDPFFyWiGSwSuQeiyJFZxqGkNDznp', // where to transact to
        'contract':'',                                          // TODO? -> smart contract address
        'amount':0.1,                                           // amount to send
        'fee':1,                                                // fee for the miners or the system
        'unspent':{                                             // Bitcoin derived cryptocurrencies need unspents to be able to generate transactions
                  },
        'factor':8,                                             // amount of decimals, i.e.: 10^x
      }
    }

if(typeof deterministic!='object' || deterministic=={}) {
  logger('Error: Cannot load deterministic wrapper!');
} else {

  //
  // generate cryptographic keys based on a seed string
  //
  input = { seed: tx[mode].seed }
  var result = deterministic.keys(input);
  tx[mode].keys = result;
  logger('SEED: '+input.seed);

  //
  // produce a public address based on cryptographic keys
  //
  var result = deterministic.address(tx[mode].keys);
  tx[mode].source_address = result;
  logger('PUBLIC ADDRESS: '+result);

  //
  // produce a public address based on cryptographic keys
  //
  logger('CONTRACT ADDRESS: '+tx[mode].contract);

  //
  // create a signed transaction
  //
  input = {
            mode:mode.split('.')[1],
            source:tx[mode].source_address,
            target:tx[mode].target_address,
            amount:toInt(tx[mode].amount,tx[mode].factor),
            fee:toInt(tx[mode].fee,tx[mode].factor),
            factor:tx[mode].factor,
            contract:tx[mode].contract,
            keys:tx[mode].keys,
            seed:tx[mode].seed,
            unspent:tx[mode].unspent
  }

  var onTransaction = function(result){
    logger('SIGNED TRANSACTION: '+result);
  }
  deterministic.transaction(input,onTransaction);

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
