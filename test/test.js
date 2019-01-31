/*
 * Test a deterministic wrapper
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

window = {};
var stdio = require('stdio');
var fs = require('fs');

var ops = stdio.getopt({
  'symbol': {key: 's', args: 1, description: 'Select a symbol to run test.'},
  'amount': {key: 'a', args: 1, description: 'Transaction amount. (Defaults to 100)'},
  'unspent': {key: 'u', args: 1, description: 'Manually specify unspents.'},
  'target': {key: 't', args: 1, description: ' Target address (Defaults to source address)'},
  'fee': {key: 'f', args: 1, description: 'Manually specify fee (Defaults to asset default fee).'},
  'seed': {args: 1, description: 'Manually specify seed (Defaults to "correct horse battery staple").'}
//  'username': {args: 1, description: 'Manually specify username.'},
//  'password': {args: 1, description: 'Manually specify password.'}
});

console.log(' [=] NODE SIDE MODULE =======================================');

var recipePath = '../../node/recipes/';
if(fs.existsSync(recipePath+'asset.'+ops.symbol+'.json')){
  console.log(' [.] Recipe file        : $HYBRIXD/node/recipes/asset.'+ops.symbol+'.json found.');
}else if(fs.existsSync(recipePath+'token.'+ops.symbol+'.json')){
  console.log(' [.] Recipe file        : $HYBRIXD/node/recipes/token.'+ops.symbol+'.json found.');
}else{
  console.log(' [!] No Recipe file found. ($HYBRIXD/node/recipes/asset.'+ops.symbol+'.json or $HYBRIXD/node/recipes/token.'+ops.symbol+'.json)');
}

var amount = ops.amount||'100';
var unspent;

if(typeof ops.unspent === 'string'){
  unspent = ops.unspent;
}else if(typeof ops.unspent !== 'undefined'){
  unspent = JSON.stringify(ops.unspent);
}

var fee = ops.fee;
var target = ops.target;

var Hybrix = require('../interface/hybrix-lib.nodejs.js');
var hybrix = new Hybrix.Interface({http: require('http')});



var showAddress = (dataCallback, errorCallback, keys, details, publicKey) => (address) =>{
  console.log(" [.] Address            :",address);
  dataCallback({address, keys, details, publicKey});
}

var showKeysGetAddress = (dataCallback, errorCallback,details) => keys =>{
  console.log(" [.] Keys               :",keys);
  var publicKey = window.deterministic.publickey(keys);
  console.log(" [.] Public Key         :",publicKey);
  var privateKey = window.deterministic.privatekey(keys);
  console.log(" [.] Private Key        :",privateKey);

  var mode = details.mode;
  var subMode = mode.split('.')[1];
  keys.mode = subMode;
  var address = window.deterministic.address(keys,showAddress(dataCallback, errorCallback, keys, details, publicKey), errorCallback );
  if(typeof address!=='undefined'){
    showAddress(dataCallback, errorCallback, keys, details, publicKey)(address);
  }
}

function getKeysAndAddress(details,dataCallback, errorCallback){

  console.log(' [.] Details            :',details)

  console.log(' [=] CLIENT SIDE MODULE  =======================================');

  var mode = details.mode;
  var baseMode = mode.split('.')[0];

  var deterministicPath = 'deterministic/modules/'+baseMode+'/deterministic.js';
  if(fs.existsSync('../../'+deterministicPath)){
    console.log(' [.] Deterministic file : $HYBRIXD/'+ deterministicPath + ' exists.');
  }else{
    console.log(' [!] Deterministic file : $HYBRIXD/'+ deterministicPath + ' does not exist!');
  }

  var deterministic;
  if(fs.existsSync('../../deterministic/modules/'+baseMode+'/compile.sh')){
    console.log(' [i] Custom compile.sh found. Using compiled version.');
    console.log(' [i] Extract lzma.');

    var blob = fs.readFileSync('../../deterministic/dist/'+baseMode+'/deterministic.js.lzma').toString('utf-8');
    var LZString = require('../common/crypto/lz-string');
    var CommonUtils = require('../common/index');

    var code = LZString.decompressFromEncodedURIComponent(blob);
    determistic = CommonUtils.activate(code);

  }else{
    console.log(' [i] No custom compile.sh found . Using uncompiled version.');
    deterministic = require("../modules/"+baseMode+"/deterministic.js");
  }

  var seed = ops.seed||"correct horse battery staple";
  //TODO if ops.username and password exist : use those to generate seed

  console.log(" [.] Seed               :",seed);
  var keys = window.deterministic.keys({seed}, showKeysGetAddress(dataCallback, errorCallback,details),errorCallback);
  if(typeof keys!=='undefined'){
    showKeysGetAddress(dataCallback, errorCallback,details)(keys);
  }

}

function outputResults(result) {
  if(typeof result.sample==='object'){
    console.log(' [.] Sample address     : '+ result.sample.address);
    console.log(' [.] Sample transaction : '+ result.sample.address);
  }else{
    console.log(' [!] No sample available.');
  }
  console.log(' [.] Contract           : '+ result.contract);
  console.log(' [.] Fee                : '+ result.fee);
  console.log(' [.] Factor             : '+ result.factor);
  console.log(' [.] Fee-symbol         : '+ result['fee-symbol']);
  console.log(' [.] Keygen-base        : '+ result['keygen-base']);
  if(typeof result.mode === 'string'){
    console.log(' [.] Mode               : '+ result.mode);
  }else{
    console.log(' [!] Mode not defined');
  }
}

function createTransaction(data, dataCallback, errorCallback){
  console.log(' [.] Unspents           : '+JSON.stringify(data.unspent));
  var tx = {
    amount : amount,
    fee: typeof fee === 'undefined'?data.result.details.fee:fee,
    keys: data.result.keys,
    source_address: data.result.address,
    target_address: target||data.result.address,
    contract:data.result.details.contract,
    unspent :unspent||data.unspent,
    factor : data.result.details.factor
  }

  var result = window.deterministic.transaction(tx, dataCallback,errorCallback);
  if(typeof result !=='undefined'){
    dataCallback(result);
  }
}

hybrix.sequential(
  [
    'init',
    {host:'http://localhost:1111/'}, 'addHost',
    {
      sample: {data:{query:'/asset/'+ops.symbol+'/sample'} ,step:'rout'},

      contract: {data:{query:'/asset/'+ops.symbol+'/contract'} ,step:'rout'},
      fee: {data:{query:'/asset/'+ops.symbol+'/fee'} ,step:'rout'},
      factor: {data:{query:'/asset/'+ops.symbol+'/factor'} ,step:'rout'},
      'fee-symbol': {data:{query:'/asset/'+ops.symbol+'/fee-symbol'} ,step:'rout'},
      'keygen-base': {data:{query:'/asset/'+ops.symbol+'/keygen-base'} ,step:'rout'},
      mode: {data:{query:'/asset/'+ops.symbol+'/mode'} ,step:'rout'}
    }, 'parallel',

    outputResults,

    {query:'/asset/'+ops.symbol+'/details'},'rout',

    details => {return {data:details,func:getKeysAndAddress}},'call',

    result => {
      return {
        unspent:{data:{query: '/asset/' + ops.symbol + '/unspent/'+result.address+'/'+(Number(amount)+Number(typeof fee === 'undefined'?result.details.fee:fee))+'/'+result.address+'/'+result.publicKey}, step:'rout'},
        result:{data:result,step:'id'}};
    }, 'parallel',
    result => {return {data: result, func:createTransaction};}, 'call',
  ],
  result => {console.log(" [.] Transaction        :",result);},
  error => {
    try{
      var data = JSON.parse(error);
      if(data.hasOwnProperty('help')){
        console.log(' [!] '+data.help)
      }else{
        console.log(' [!] '+error)
      }
    }catch(e){
      console.log(' [!] '+error)
    }
  }
);
