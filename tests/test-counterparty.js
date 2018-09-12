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

//var mode = 'bitcore.livenet';  // other modes: bitcoinjslib.bitcoin, ethereum, lisk
var mode = 'bitcoinjslib.counterparty';  // other modes: bitcoinjslib.bitcoin, ethereum, lisk
dcode = String(fs.readFileSync('./modules/deterministic/'+mode.split('.')[0]+'/deterministic.js.lzma'))
//require(LZString.decompressFromEncodedURIComponent(dcode));
var deterministic = activate( LZString.decompressFromEncodedURIComponent(dcode) );

var input = {}

var tx = {
      'bitcoinjslib.counterparty': {
        'seed':'correct horse battery staple',                  // seed string for deterministic wallet
        'keys':null,                                            // cryptographic keys (will be generated)
        'source_address':null,                                  // where to transact from (will be generated)
        'target_address':'19afYX8D5G8nGVJte6z7png1gfeUaHdXid',  // where to transact to
        'contract':'XCP',                                       // TODO? -> smart contract address
        'amount':"0.01",                                          // amount to send
        'fee':"0.00002",                                          // fee for the miners or the system
        'unspent':                                              // Bitcoin derived cryptocurrencies need unspents to be able to generate transactions
            {
              "unspents":[{"script":"76a914b31e2e79c5bdf335cc7be3e22c948d5c5f3ba0ff88ac","amount":"0.00033920","txid":"fd6a4dcc29ad5cbd2d3ccddea2788ef80828c3b28cea6b20bf603782ebbc05c2","txn":1}],"change":"0.0001255",
              "unsignedtx":"0100000001c205bceb823760bf206bea8cb2c32808f88e78a2decd3c2dbd5cad29cc4d6afd010000001976a914b31e2e79c5bdf335cc7be3e22c948d5c5f3ba0ff88acffffffff020000000000000000306a2e3ffaa8ac4c1f16f65f8f2ff3f75f66453d620485b2ddbbedf9e933254d7c0b576d8124f621ddaa49987972f87c95d4760000000000001976a914b31e2e79c5bdf335cc7be3e22c948d5c5f3ba0ff88ac00000000"
            },
        'factor':8,                                             // amount of decimals, i.e.: 10^x
      }
    }

/*

unsigned TX for: /asset/xcp/unspent/1HL67PWtvZaQfDoxuGXivn8U5WJ76toceZ/0.01/1KWsPEb3bp7nQuodUtZYHQsXmBCDZ9dtPz
0100000001b84fcb6bca5075bb753c8100e835805703f536a7ac27b3a5f6de45c5a7d65ffd000000001976a914b31e2e79c5bdf335cc7be3e22c948d5c5f3ba0ff88acffffffff020000000000000000306a2ea37397180cd2c4e9aa24c87ae95e04fc1cbf24857a88b0433d84d22529259deccc37fa73a27775e737cce631787cf4240f00000000001976a914b31e2e79c5bdf335cc7be3e22c948d5c5f3ba0ff88ac00000000

 */

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

  // prepare unspent change
  tx[mode].unspent.change = toInt(tx[mode].unspent.change,tx[mode].factor);

  // amend fee to account for payload bytes (Counterparty)
  //tx[mode].fee = tx[mode].fee + (0.0000025000*tx[mode].testpayload.length);
  //logger('FEE AFTER PAYLOAD: '+tx[mode].fee+' BTC');

  // put it all together
  input = {
            mode:mode.split('.')[1],
            source:'1HL67PWtvZaQfDoxuGXivn8U5WJ76toceZ',//tx[mode].source_address,
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
    logger('SIGNED TRANSACTION (CALLBACK): '+result);
  }

  result = deterministic.transaction(input,onTransaction);
  if(result) {
    logger('SIGNED TRANSACTION: '+result);
  }

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
