/*
 * Test a deterministic wrapper
 */

window = {};
var stdio = require('stdio');

var ops = stdio.getopt({
  'symbol': {key: 's', args: 1, description: 'Select a symbol to run test.'},
  'amount': {key: 'a', args: 1, description: 'Transaction amount.'},
  'unspent': {key: 'u', args: 1, description: 'Manually specify unspents.'},
  'target': {key: 't', args: 1, description: ' Target address (Defaults to source address)'},
  'fee': {key: 'f', args: 1, description: 'Manually specify fee.'}
});

var amount = '100';
var unspent;

if(typeof ops.unspent === 'string'){
  unspent= ops.unspent;
}else if(typeof ops.unspent !== 'undefined'){
  unspent= JSON.stringify(ops.unspent);
}

var fee = ops.fee;
var target = ops.target;


var Hybrix = require('../interface/hybrix-lib.nodejs.js');
var hybrix = new Hybrix.Interface({http: require('http')});

function getKeysAndAddress(details){

  var mode = details.mode;
  var baseMode = mode.split('.')[0];
  var subMode = mode.split('.')[1];


  var deterministic = require("../modules/"+baseMode+"/deterministic.js");
  console.log('Details',details)

  var seed = "correct horse battery staple";
  console.log("Seed:",seed);
  var keys = window.deterministic.keys({seed});
  console.log("Keys:",keys);

  var publicKey = window.deterministic.publickey(keys);
  console.log("Public Key:",publicKey);
  var privateKey = window.deterministic.privatekey(keys);
  console.log("Private Key:",privateKey);

  keys.mode = subMode;
  var address = window.deterministic.address(keys);
  console.log("Address:",address);
  return {address, keys, details, publicKey};
}



function createTransaction(data, dataCallback, errorCallback){
  console.log('Unspents: '+JSON.stringify(data.unspent));
  var tx = {
    amount : amount,
    fee: typeof fee === 'undefined'?data.result.details.fee:fee, //TODO
    keys: data.result.keys,
    source_address: data.result.address,
    target_address: target||data.result.address,
    contract:data.result.details.contract,
    unspent :unspent||data.unspent,//TODO
    factor : data.result.details.factor
  }

  var result = window.deterministic.transaction(tx, dataCallback);
  if(typeof result !=='undefined'){
    dataCallback(result);
  }
}

hybrix.sequential(
  [
    'init',
    {host:'http://localhost:1111/'}, 'addHost',
    {query:'/asset/'+ops.symbol+'/details'},'rout',
    getKeysAndAddress,
    result => {
      return {
        unspent:{data:{query: '/asset/' + ops.symbol + '/unspent/'+result.address+'/'+(Number(amount)+Number(typeof fee === 'undefined'?result.details.fee:fee))+'/'+result.address+'/'+result.publicKey}, step:'rout'},
        result:{data:result,step:'id'}};
    }, 'parallel',
    result => {return {data: result, func:createTransaction};}, 'call'
  ],
  result => {console.log("Transaction:",result);},
  console.error
);
//TODO get unspents
