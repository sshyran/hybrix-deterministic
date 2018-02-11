/*
 * Example to test a deterministic wrapper
 */

fs = require('fs');
nacl = require('./lib/crypto/nacl');
crypto = require('crypto');                   // this supersedes browserify crypto library when code is run in virtual DOM
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

var mode = 'nem.testnet';  // other modes: bitcoinjslib.bitcoin, ethereum, lisk

var submode = mode.split('.')[1];
dcode = String(fs.readFileSync('./modules/deterministic/'+mode.split('.')[0]+'/deterministic.js.lzma'))
//require(LZString.decompressFromEncodedURIComponent(dcode));
var deterministic = activate( LZString.decompressFromEncodedURIComponent(dcode) );

var input = {}

var tx = {
  'bitcoinjslib.bitcoin': {
    'seed':'correct horse battery staple',                  // seed string for deterministic wallet
    'keys':null,                                            // cryptographic keys (will be generated)
    'source_address':null,                                  // where to transact from (will be generated)
    'target_address':'1NqE1uw9iSqq3U4KpbTmYvjiAwHj85XUMj',  // where to transact to
    'amount':0.1,                                           // amount to send
    'fee':0.00075,                                          // fee for the miners or the system
    'unspent': {                                             // Bitcoin derived cryptocurrencies need unspents to be able to generate transactions
      'unspents':[{ "amount":"1.00",
                    "txid":"eee76ed5dae07eb798dd309ccbf1b08bad4e0e8fee806d28fe08b9cbed67ed95",
                    "txn":0
                 }]
    },
    'factor':8,                                             // amount of decimals, i.e.: 10^x
  },
  'zcash.testnet': {
    'seed': 'correct horse battery staple',                  // seed string for deterministic wallet
    'keys': null,                                            // cryptographic keys (will be generated from seed)
    'source_address': null,                                  // where to transact from (will be generated from seed)
    'target_address': 'tmUzQde5E4cMtdHPmeXfipEVUbDF8QBbuKY', // where to transact to
    'amount': 0.1,                                           // amount to send
    'fee'   : 0.00075,                                       // fee for the miners or the system
    'unspent': {                                             // UTXOs to spend
      // how to get this data from zcashd:
      // 1. out := zcash-cli getrawtransaction <txid>
      // 2. zcash-cli decoderawtransaction <out>
      // 3. look for vout to the address you own (most probably in scriptPubKey.addresses)
      // 3.1. "n" for "txn"
      // 3.2. "value" for "amount"
      // 3.3. "scriptPubKey.hex" for "script"
      'unspents': [  { "txid": "34b681c3bab292592789c0dc95b010677034096143bbe4bee4c7c53e58646feb",
                       "txn" : 0,
                       "amount" : 0.5,
                       "address": "tmLqLxdaL7z4wjvXzmC3EkZCyQ4b17eMQzR", // WIF: cUB8G5cFtxc4usfgfovqRgCo8qTQUJtctLV8t6YYNfULg3GtehdX
                       "script" : "76a91479fbfc3f34e7745860d76137da68f362380c606c88ac"
                     }
                  ]
    },
    'factor': 8                                              // amount of decimals, i.e.: 10^x
  },
  'ethereum.token': {
    'seed':'correct horse battery staple',                  // seed string for deterministic wallet
    'keys':null,                                            // cryptographic keys (will be generated)
    'source_address':null,                                  // where to transact from (will be generated)
    'target_address':'0x8Bbf8f56ed5C694beF9F0f6D74365D663517E67a',  // where to transact to
    'contract':'0x2f4baef93489b09b5e4b923795361a65a26f55e5',  // smart contract address
    'amount':0.1,                                           // amount to send
    'fee':0.00075,                                          // fee for the miners or the system
    'unspent':{                                             // Bitcoin derived cryptocurrencies need unspents to be able to generate transactions
      'nonce':'0x00', // Ethereum needs a nonce, so we in that case add it here into 'unspent requirements' #BETTERSUGGESTION ?
    },
    'factor':8,                                             // amount of decimals, i.e.: 10^x
  },
  // 'nem.testnet': {
  //   'seed':'correct horse battery staple',                  // seed string for deterministic wallet
  //   'keys':null,                                            // cryptographic keys (will be generated)
  //   'source_address':null,                                  // where to transact from (will be generated)
  //   'target_address':'TD367M-ZTCOJP-N3XBDG-EOKHO4-HFZDQB-B25X5I-54Z2',  // where to transact to
  //   'amount':0.1,                                           // amount to send
  //   'fee':0.00075,                                          // fee for the miners or the system
  //   'factor':1,                                             // amount of decimals, i.e.: 10^x (6, but nem-sdk is doing this conversion for us)
  // },
  'nem.testnet': {
    'seed':'correct horse battery staple',                  // seed string for deterministic wallet
    'keys':null,                                            // cryptographic keys (will be generated)
    'source_address':null,                                  // where to transact from (will be generated)
    'target_address':'TD367M-ZTCOJP-N3XBDG-EOKHO4-HFZDQB-B25X5I-54Z2',  // where to transact to
    'amount':0.1,                                           // amount to send, for xem transfer mode, ignored in mosaic mode
    'fee':0.00075,                                          // fee for the miners or the system
    'factor':1,                                             // amount of decimals, i.e.: 10^x (6, but nem-sdk is doing this conversion for us)
    'mosaics': [                                            // regular xem transfer if undefined
      { 'amount': 1.35,
        'definition': {
          "creator": "cf07d5d757cbb0df22a8e9ee931034afc86bec9fafe3487f1ecdc2d584e3a6bd",
          "description": "WunderWaffel",
          "id": {
            "namespaceId": "namespacex",
            "name": "wunderwaffel"
          },
          "properties": [
            {
              "name": "divisibility",
              "value": "3"
            },
            {
              "name": "initialSupply",
              "value": "1000"
            },
            {
              "name": "supplyMutable",
              "value": "true"
            },
            {
              "name": "transferable",
              "value": "true"
            }
          ],
          "levy": {}
        }
      },
      { 'amount': 1,
        'definition': {
          "creator": "cf07d5d757cbb0df22a8e9ee931034afc86bec9fafe3487f1ecdc2d584e3a6bd",
          "description": "Tesla Rodster",
          "id": {
            "namespaceId": "namespacex.boosters",
            "name": "teslarodster"
          },
          "properties": [
            {
              "name": "divisibility",
              "value": "0"
            },
            {
              "name": "initialSupply",
              "value": "100"
            },
            {
              "name": "supplyMutable",
              "value": "true"
            },
            {
              "name": "transferable",
              "value": "true"
            }
          ],
          "levy": {
            "fee": 5,
            "recipient": "TD367MZTCOJPN3XBDGEOKHO4HFZDQBB25X5I54Z2",
            "type": 1,
            "mosaicId": {
              "namespaceId": "nem",
              "name": "xem"
            }
          }
        }
      }
    ]
  }
}

if(typeof deterministic!='object' || deterministic=={}) {
  logger('Error: Cannot load deterministic wrapper!');
} else {

  //
  // generate cryptographic keys based on a seed string
  //
  input = { seed: tx[mode].seed, mode: submode }
  logger('SEED: ' + input.seed);

  var result = deterministic.keys(input);
  logger('KEYS: ' + JSON.stringify(result, null, 2));

  tx[mode].keys = result;
  
  //
  // produce a public address based on cryptographic keys
  //
  var result = deterministic.address({ keys: tx[mode].keys, mode: submode });
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
            source:   tx[mode].source_address,
            target:   tx[mode].target_address,
            amount:   toInt(tx[mode].amount, tx[mode].factor),
            fee:      toInt(tx[mode].fee, tx[mode].factor),
            factor:   tx[mode].factor,
            contract: tx[mode].contract,
            keys:     tx[mode].keys,
            seed:     tx[mode].seed,
            unspent:  tx[mode].unspent,
            mode:     submode,
            mosaics:  tx[mode].mosaics  // nem-specific
          }
  var result = deterministic.transaction(input);
  logger('SIGNED TRANSACTION: ' + JSON.stringify(result, null, 2));

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
