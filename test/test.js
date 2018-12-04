/*
 * Test a deterministic wrapper
 */

window = {};
var stdio = require('stdio');

var ops = stdio.getopt({
  'symbol': {key: 's', args: 1, description: 'Select a symbol to run test'}
});


nacl_factory = require('../common/crypto/nacl.js');
var hybrixd = require('../interface/hybrixd.interface.nodejs.js');
var hybrixd = new hybrixd.Interface({http: require('http')});


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
  return {address, keys, details};
}


function createTransaction(data, dataCallback, errorCallback){


  var tx = {
    amount :'100',//TODO
    fee: data.details.fee,//TODO
    keys: data.keys,
    source_address: data.address,
    target_address: data.address,//TODO
    contract:data.details.contract,//TODO
    unspent :'0',//TODO
    factor : data.details.factor //TODO
  }

  var result = window.deterministic.transaction(tx, dataCallback);
  if(typeof result !=='undefined'){
    dataCallback(result);
  }
}

hybrixd.sequential(
  [
    'init',
    {host:'http://localhost:1111/'}, 'addHost',
    {query:'/asset/'+ops.symbol+'/details'},'rout',
    getKeysAndAddress,
    result => {return {data: result, func:createTransaction};}, 'call'
  ],
  result => {console.log("Transaction:",result);},
  console.error
);
//TODO get unspents
