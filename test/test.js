/*
 * Test a deterministic wrapper
 *
 * Assumes you have a local Hybrixd running at http://localhost:1111/
 */

/*
  TODO
  - check if fee is number, factor is integer, other things are strings etc
  - check if details match direct calls  (e.g. /a/$SYMBOL/details.mode === /a/$SYMBOL/mode etc.
  - use username and password to create a seed
  - compile if not yet up to date
  - check balance (for generated and sample)
  - check transaction (for sample)
  - check history (for generated and sample)
*/

'use strict';

const stdio = require('stdio');
const fs = require('fs');

const ops = stdio.getopt({
  'symbol': {key: 's', args: 1, description: 'Select a symbol to run test.'},
  'amount': {key: 'a', args: 1, description: 'Transaction amount. (Defaults to 100)'},
  'unspent': {key: 'u', args: 1, description: 'Manually specify unspents.'},
  'target': {key: 't', args: 1, description: ' Target address (Defaults to source address)'},
  'fee': {key: 'f', args: 1, description: 'Manually specify fee (Defaults to asset default fee).'},
  'seed': {args: 1, description: 'Manually specify seed (Defaults to "correct horse battery staple").'}
//  'username': {args: 1, description: 'Manually specify username.'},
//  'password': {args: 1, description: 'Manually specify password.'}
});

// if we were called without arguments, display a message
if(!ops.symbol) {
  console.log('\nThis script tests a deterministic wrapper. A Hybrixd needs to be running for it to work. \n\nUsage example:\n');
  console.log('./run test.js --symbol=dummy\n');
  console.log('For help, type:\n');
  console.log('./run test.js --help\n');

  process.exit(1);
}

console.log(' [=] NODE SIDE MODULE =======================================');

const recipePath = '../../node/recipes/';
if (fs.existsSync(recipePath + 'asset.' + ops.symbol + '.json')) {
  console.log(' [.] Recipe file        : $HYBRIXD/node/recipes/asset.' + ops.symbol + '.json found.');
} else if (fs.existsSync(recipePath + 'token.' + ops.symbol + '.json')) {
  console.log(' [.] Recipe file        : $HYBRIXD/node/recipes/token.' + ops.symbol + '.json found.');
} else {
  console.log(' [!] No Recipe file found. ($HYBRIXD/node/recipes/asset.' + ops.symbol + '.json or $HYBRIXD/node/recipes/token.' + ops.symbol + '.json)');
}

const amount = ops.amount || '100';
let unspent;

if (typeof ops.unspent === 'string') {
  unspent = ops.unspent;
} else if (typeof ops.unspent !== 'undefined') {
  unspent = JSON.stringify(ops.unspent);
}

const fee = ops.fee;
const target = ops.target;

const Hybrix = require('../interface/hybrix-lib.nodejs.js');
const hybrix = new Hybrix.Interface({http: require('http')});

function getKeysAndAddress(details) {

  console.log(' [.] Details            :', details)

  console.log(' [=] CLIENT SIDE MODULE  =======================================');

  const mode = details.mode;
  const baseMode = mode.split('.')[0];
  const subMode = mode.split('.')[1];

  const deterministicPath = 'deterministic/modules/' + baseMode + '/deterministic.js';
  if (fs.existsSync('../../' + deterministicPath)) {
    console.log(' [.] Deterministic file : $HYBRIXD/' + deterministicPath + ' exists.');
  } else {
    console.log(' [!] Deterministic file : $HYBRIXD/' + deterministicPath + ' does not exist!');
  }

  let deterministic;
  if (fs.existsSync('../../deterministic/modules/' + baseMode + '/compile.sh')) {
    console.log(' [i] Custom compile.sh found. Using compiled version.');
    console.log(' [i] Extract lzma.');

    const blob = fs.readFileSync('../../deterministic/dist/' + baseMode + '/deterministic.js.lzma').toString('utf-8');
    const LZString = require('../common/crypto/lz-string');
    const CommonUtils = require('../common/index');

    const code = LZString.decompressFromEncodedURIComponent(blob);
    deterministic = CommonUtils.activate(code);


  } else {
    console.log(' [i] No custom compile.sh found . Using uncompiled version.');


    deterministic = require('../modules/' + baseMode + '/deterministic.js');
  }


  const seed = ops.seed || 'correct horse battery staple';
  //TODO if ops.username and password exist : use those to generate seed

  console.log(' [.] Seed               :', seed);
  const keys = window.deterministic.keys({seed});
  console.log(' [.] Keys               :', keys);

  const publicKey = window.deterministic.publickey(keys);
  console.log(' [.] Public Key         :', publicKey);
  const privateKey = window.deterministic.privatekey(keys);
  console.log(' [.] Private Key        :', privateKey);

  keys.mode = subMode;
  const address = window.deterministic.address(keys);
  console.log(' [.] Address            :', address);
  return {address, keys, details, publicKey};
}

function outputResults(result) {
  if (typeof result.sample === 'object') {
    console.log(' [.] Sample address     : ' + result.sample.address);
    console.log(' [.] Sample transaction : ' + result.sample.address);
  } else {
    console.log(' [!] No sample available.');
  }
  console.log(' [.] Contract           : ' + result.contract);
  console.log(' [.] Fee                : ' + result.fee);
  console.log(' [.] Factor             : ' + result.factor);
  console.log(' [.] Fee-symbol         : ' + result['fee-symbol']);
  console.log(' [.] Keygen-base        : ' + result['keygen-base']);
  if (typeof result.mode === 'string') {
    console.log(' [.] Mode               : ' + result.mode);
  } else {
    console.log(' [!] Mode not defined');
  }
}

function createTransaction(data, dataCallback, errorCallback) {
  console.log(' [.] Unspents           : ' + JSON.stringify(data.unspent));
  const tx = {
    amount: amount,
    fee: typeof fee === 'undefined' ? data.result.details.fee : fee,
    keys: data.result.keys,
    source_address: data.result.address,
    target_address: target || data.result.address,
    contract: data.result.details.contract,
    unspent: unspent || data.unspent,
    factor: data.result.details.factor
  };

  const result = window.deterministic.transaction(tx, dataCallback);
  if (typeof result !== 'undefined') {
    dataCallback(result);
  }
}

hybrix.sequential(
    [
      'init',
      {host: 'http://localhost:1111/'}, 'addHost',
      {
        sample: {data: {query: '/asset/' + ops.symbol + '/sample'}, step: 'rout'},

        contract: {data: {query: '/asset/' + ops.symbol + '/contract'}, step: 'rout'},
        fee: {data: {query: '/asset/' + ops.symbol + '/fee'}, step: 'rout'},
        factor: {data: {query: '/asset/' + ops.symbol + '/factor'}, step: 'rout'},
        'fee-symbol': {data: {query: '/asset/' + ops.symbol + '/fee-symbol'}, step: 'rout'},
        'keygen-base': {data: {query: '/asset/' + ops.symbol + '/keygen-base'}, step: 'rout'},
        mode: {data: {query: '/asset/' + ops.symbol + '/mode'}, step: 'rout'}
      }, 'parallel',

      outputResults,

      {query: '/asset/' + ops.symbol + '/details'}, 'rout',

      getKeysAndAddress,

      result => {
        return {
          unspent: {
            data: {query: '/asset/' + ops.symbol + '/unspent/' + result.address + '/' + (Number(amount) + Number(typeof fee === 'undefined' ? result.details.fee : fee)) + '/' + result.address + '/' + result.publicKey},
            step: 'rout'
          },
          result: {data: result, step: 'id'}
        };
      }, 'parallel',
      result => {
        return {data: result, func: createTransaction};
      }, 'call',
    ],
    result => {
      console.log(' [.] Transaction        :', result);
      console.log(`\n [OK] Successfully ran test for symbol ${ops.symbol}\n`);
    },
    error => {
      try {
        const data = JSON.parse(error);
        if (data.hasOwnProperty('help')) {
          console.log(' [!] ' + data.help)
        } else {
          console.log(' [!] ' + error)
        }
      } catch (e) {
        console.log(' [!] ' + error)
      }
    }
);
