/*
 * Test a deterministic wrapper
 */

'use strict';

const stdio = require('stdio');
const fs = require('fs');
const CommonUtils = require('../common/index');
const Decimal = require('../common/crypto/decimal-light');

const ops = stdio.getopt({
  'symbol': {key: 's', args: 1, description: 'Select a symbol to run test.'},
  'amount': {key: 'a', args: 1, description: 'Transaction amount. (Defaults to 100)'},
  'unspent': {key: 'u', args: 1, description: 'Manually specify unspents.'},
  'target': {key: 't', args: 1, description: ' Target address (Defaults to source address)'},
  'fee': {key: 'f ', args: 1, description: 'Manually specify fee (Defaults to asset default fee).'},
  'seed': {args: 1, description: 'Manually specify seed. NOTE: Never store the credentials anywhere unencrypted, run the command through an IDE and not through a command line, and have a separate test account ready with only small amounts.'},
  'username': {args: 1, description: 'Manually specify username.'},
  'password': {args: 1, description: 'Manually specify password.'},
  'push': {key: 'p', args: 0, description: 'Push the signed transaction to the target chain. Restrictions such as transaction cost and funding requirements may apply. Also, you might want to specify --seed for this to work.'}
});

// if we were called without arguments, display a message
if (!ops.symbol) {
  console.log('\nThis script tests a deterministic wrapper. A Hybrixd needs to be running for it to work. \n\nUsage example:\n');
  console.log('./run test.js --symbol=dummy\n');
  console.log('For help, type:\n');
  console.log('./run test.js --help\n');

  process.exit(1);
}

let coinSpecificTestData = {};

const username = ops.username || 'BGQCUO55L57O266P';
const password = ops.password || '6WAE5LYKAADLZ4P3YLE3EGBSNUKMLV4VGU4UJ6JZV7SEE276';

console.log(' [=] NODE SIDE MODULE =======================================');

const recipePath = '../../node/recipes/';
if (fs.existsSync(recipePath + 'asset.' + ops.symbol + '.json')) {
  console.log(' [.] Recipe file        : $HYBRIXD/node/recipes/asset.' + ops.symbol + '.json found.');
} else if (fs.existsSync(recipePath + 'token.' + ops.symbol + '.json')) {
  console.log(' [.] Recipe file        : $HYBRIXD/node/recipes/token.' + ops.symbol + '.json found.');
} else {
  console.log(' [!] No Recipe file found. ($HYBRIXD/node/recipes/asset.' + ops.symbol + '.json or $HYBRIXD/node/recipes/token.' + ops.symbol + '.json)');
}

const amount = ops.amount || '1000';
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

const showAddress = (dataCallback, errorCallback, keys, details, publicKey) => (address) => {
  console.log(' [.] Address            :', address);
  dataCallback({address, keys, details, publicKey});
};

const showKeysGetAddress = (dataCallback, errorCallback, details) => keys => {
  console.log(' [.] Keys               :', keys);
  const publicKey = window.deterministic.publickey(keys);
  console.log(' [.] Public Key         :', publicKey);
  const privateKey = window.deterministic.privatekey(keys);
  console.log(' [.] Private Key        :', privateKey);

  const mode = details.mode;

  const subMode = mode.split('.')[1];
  keys.mode = subMode;
  const address = window.deterministic.address(keys, showAddress(dataCallback, errorCallback, keys, details, publicKey), errorCallback);
  if (typeof address !== 'undefined') {
    showAddress(dataCallback, errorCallback, keys, details, publicKey)(address);
  }
};

function getKeysAndAddress (details, dataCallback, errorCallback) {
  console.log(' [.] Details            :', details);
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

  if (fs.existsSync('../../deterministic/modules/' + baseMode + '/compile.sh')) {
    console.log(' [i] Custom compile.sh found. Using compiled version.');
    console.log(' [i] Extract lzma.');

    const blob = fs.readFileSync('../../deterministic/dist/' + baseMode + '/deterministic.js.lzma').toString('utf-8');
    const LZString = require('../common/crypto/lz-string');

    const code = LZString.decompressFromEncodedURIComponent(blob);
    CommonUtils.activate(code);
  } else {
    console.log(' [i] No custom compile.sh found . Using uncompiled version.');
    require('../modules/' + baseMode + '/deterministic.js');
  }

  const userKeys = CommonUtils.generateKeys(password, username, 0);
  const seed = ops.seed || CommonUtils.seedGenerator(userKeys, details['keygen-base']);

  console.log(' [.] Seed               :', seed);
  const keys = window.deterministic.keys({seed, mode: subMode}, showKeysGetAddress(dataCallback, errorCallback, details), errorCallback);
  if (typeof keys !== 'undefined') {
    showKeysGetAddress(dataCallback, errorCallback, details)(keys);
  }
}

function outputResults (result) {
  coinSpecificTestData = result.test;

  if (typeof result.sample === 'object') {
    console.log(' [.] Sample address     : ' + result.sample.address);
    console.log(' [.] Sample transaction : ' + result.sample.transaction);
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

let toIntLocal = function (input, factor) {
  let f = Number(factor);
  let x = new Decimal(String(input));
  return x.times('1' + (f > 1 ? '0'.repeat(f) : '')).toString();
};

function createTransaction (data, dataCallback, errorCallback) {
  let actualUnspent;
  if (typeof unspent !== 'undefined') {
    actualUnspent = unspent;
    console.log(' [.] Unspents           : ' + JSON.stringify(actualUnspent) + ' (Manual)');
  } else if (coinSpecificTestData && coinSpecificTestData.hasOwnProperty('unspent')) {
    actualUnspent = coinSpecificTestData.unspent;
    console.log(' [.] Unspents           : ' + JSON.stringify(actualUnspent) + ' (Coin specific test data )');
  } else {
    actualUnspent = data.unspent;
    console.log(' [.] Unspents           : ' + JSON.stringify(actualUnspent));
  }
  const tx = {
    symbol: data.result.details.symbol,
    amount: amount,
    fee: toIntLocal(typeof fee === 'undefined' ? data.result.details.fee : fee, data.result.details['fee-factor']),
    keys: data.result.keys,
    source: data.result.address,
    target: target || data.result.address,
    contract: data.result.details.contract,
    mode: data.result.details.mode,
    unspent: actualUnspent,
    factor: data.result.details.factor
  };

  const result = window.deterministic.transaction(tx, dataCallback, errorCallback);
  if (typeof result !== 'undefined') {
    dataCallback(result);
  }
}

/**
 * When the optional --push flag is specified, the transaction is pushed to the target chain.
 *
 * Restrictions such as transaction cost and funding requirements may apply.
 *
 * @param signedTrxData The signed transaction data
 * @returns The Hybrix command for 'push', depending on the --push flag
 */
function optionalPushToTargetChain (signedTrxData) {
  return ops.push
    ? {result: {data: {query: `/asset/${ops.symbol}/push/${signedTrxData}`}, step: 'rout'}}
    : {result: {data: {signedTrxData}, step: 'id'}};
}

function outputAndCheckHash (signedTrxDataAndHash) {
  console.log(' [.] Transaction        :', signedTrxDataAndHash.signedTrxData);
  console.log(' [.] Transaction Hash   :', signedTrxDataAndHash.hash);

  if (coinSpecificTestData.hasOwnProperty('hash')) {
    if (signedTrxDataAndHash.hash === coinSpecificTestData.hash) {
      console.log(' [v] Test Hash          :', coinSpecificTestData.hash, '[MATCH]');
    } else {
      console.log(' [!] Test Hash          :', coinSpecificTestData.hash, '[NO MATCH!]');
    }
  } else {
    console.log(' [i] Test Hash          :', 'NOT AVAILABLE');
  }
}

hybrix.sequential(
  [
    'init',
    {host: 'http://localhost:1111/'}, 'addHost',
    {
      sample: {data: {query: '/asset/' + ops.symbol + '/sample'}, step: 'rout'},
      test: {data: {query: '/asset/' + ops.symbol + '/test'}, step: 'rout'},
      contract: {data: {query: '/asset/' + ops.symbol + '/contract'}, step: 'rout'},
      fee: {data: {query: '/asset/' + ops.symbol + '/fee'}, step: 'rout'},
      factor: {data: {query: '/asset/' + ops.symbol + '/factor'}, step: 'rout'},
      'fee-symbol': {data: {query: '/asset/' + ops.symbol + '/fee-symbol'}, step: 'rout'},
      'keygen-base': {data: {query: '/asset/' + ops.symbol + '/keygen-base'}, step: 'rout'},
      mode: {data: {query: '/asset/' + ops.symbol + '/mode'}, step: 'rout'}
    }, 'parallel',

    outputResults,

    {query: '/asset/' + ops.symbol + '/details'}, 'rout',

    details => {
      return {data: details, func: getKeysAndAddress};
    }, 'call',

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
    result => { return {hash: {data: {data: result}, step: 'hash'}, signedTrxData: {data: result, step: 'id'}}; }, 'parallel',

    outputAndCheckHash,

    // When the optional --push flag is specified, the transaction is pushed to the target chain.
    // Restrictions such as transaction cost and funding requirements may apply.
    optionalPushToTargetChain

  ],
  result => {
    console.log(`\n [OK] Successfully ran test for symbol ${ops.symbol}\n`);
  },
  error => {
    try {
      const data = JSON.parse(error);
      if (data.hasOwnProperty('help')) {
        console.log(' [!] ' + data.help);
      } else {
        console.log(' [!] ' + error);
      }
    } catch (e) {
      console.log(' [!] ' + error);
    }
  }
);
