// (C) 2017 Internet of Coins / Joachim de Koning
// hybrixd module - bitshares/deterministic.js
// Deterministic encryption wrapper for Bitshares

/*

create account: mammamia123
WalletActions.js:86 new active pubkey BTS7ppPRoomSiVWoUV7F7Bg72oXB3wkPUpiyK5Tp1GqZN9HDhaoGo
WalletActions.js:87 new owner pubkey BTS7bdLsDoqfM6mbnNZk8G7ejhCgh9XLgrEwWPVt6uw6e5exKxYhp
WalletActions.js:108 >>>> Host: https://faucet.bitshares.eu/onboarding
WalletActions.js:110 >>>> Request: {"method":"post","mode":"cors","headers":{"Accept":"application/json","Content-type":"application/json"},"body":"{\"account\":{\"name\":\"mammamia123\",\"owner_key\":\"BTS7bdLsDoqfM6mbnNZk8G7ejhCgh9XLgrEwWPVt6uw6e5exKxYhp\",\"active_key\":\"BTS7ppPRoomSiVWoUV7F7Bg72oXB3wkPUpiyK5Tp1GqZN9HDhaoGo\",\"memo_key\":\"BTS7ppPRoomSiVWoUV7F7Bg72oXB3wkPUpiyK5Tp1GqZN9HDhaoGo\",\"refcode\":null,\"referrer\":null}}"}

*/

var wrapperlib = require('./wrapperlib');

var WebSocket = require('ws');

//TODO move to node
// function to perform websocket login and request
function webSocketCall(request,dataCallback,errorCallback){
  var webSocket = new WebSocket("wss://bitshares.crypto.fans/ws");
  webSocket.onopen = function(){
    var loginRequest = {'method': 'call', 'params': [1, 'login', ['', '']], 'id': 1};
    webSocket.send(JSON.stringify(loginRequest));
  };
  webSocket.onmessage = function (evt){
    var data = JSON.parse(evt.data);
    if(data.id===1){ // Receive login reply
      if(data.result===true){
        this.request.id=2;
        this.webSocket.send(JSON.stringify(this.request));
      }else{
        errorCallback("Login failed");
      }
    }else if(data.id===2){
      webSocket.close();
      dataCallback(data);
    }
  }.bind({request,webSocket})
  webSocket.onerror = function(msg){
    errorCallback(msg);
    webSocket.close();
  }
}

// function to perform CORS call to faucet
function httpCall(request, dataCallback,errorCallback){

  var url = "https://faucet.bitshares.eu/api/v1/accounts";

  var http = new XMLHttpRequest();

  if ("withCredentials" in http) {

    http.open("POST", url, true);

  } else if (typeof XDomainRequest != "undefined") {

    http = new XDomainRequest();
    http.open("POST", url);

  } else {

    console.error("CORS not supported by browser");
    errorCallback("CORS not supported by browser");
    return;
  }
  //     HEADERS -
  //              Origin: http://foo.com
  //                d: POST
  //     Access-Control-Request-Headers: Api-Key
  //   http.setRequestHeader("Access-Control-Request-Method", "POST");
  http.setRequestHeader("Content-type", "application/json");
  // http.setRequestHeader("Origin", "http://api.bob.com");
  //  http.setRequestHeader('X-Custom-Header', 'value');
  http.setRequestHeader("Accept", "application/json");

  http.onreadystatechange = function() {//Call a function when the state changes.
    if(this.http.readyState === 4){
      if(this.http.status === 200) {
        console.log("Data: "+this.http.responseText)
        // dataCallback(http.responseText);
      }else{
        console.log("Error: status"+this.http.status);
        errorCallback("http status: "+http.status);
      }
    }
  }.bind({http});

  http.send(JSON.stringify(request));
}


var wrapper = (
  function() {

    var functions = {

      // create deterministic public and private keys based on a seed
      keys : function(data) {
        var privateKeyObj = wrapperlib.bitshares.PrivateKey.fromSeed( wrapperlib.bitshares.key.normalize_brainKey(data.seed) );
        var privateKey = privateKeyObj.toWif();
        var publicKey = privateKeyObj.toPublicKey().toString();
       // console.log(JSON.stringify(wrapperlib.bitshares.Address.fromPublic(privateKeyObj.toPublicKey()).toString()));
//       == GPH5XrppwceQGroQuvUDD5KHR5QbcbrH6D1v
        return {privateKeyObj:privateKeyObj,privateKey:privateKey,publicKey:publicKey};
      },

      // generate a unique wallet address from a given public key
      address : function(keys) {
        return 'IoC'+keys.publicKey.substr(3); // Replace GPH with IoC (later to be replaced with BTS)
      },

      // Check if the address is valid and return alternative address
      validate : function(address,callback){

        var dataCallback = function(data){
          if(data.result && data.result.id){
            this.callback({error:0, alternative_address:data.result.id, valid:true});
          }else{
            this.callback({error:0, alternative_address:null, valid:false});
          }
        }.bind({callback});

        var errorCallback = function(data){
          this.callback({error:1});
        }.bind({callback});

        var request = {'id':1, 'method':'call', 'params':[0,'get_account_by_name',[address]], id: 2};
        webSocketCall(request,dataCallback,errorCallback);

/*

Success Data: {"id":2,"jsonrpc":"2.0","result":{"id":"1.2.924288","membership_expiration_date":"1970-01-01T00:00:00","registrar":"1.2.35641","referrer":"1.2.35641","lifetime_referrer":"1.2.35641","network_fee_percentage":2000,"lifetime_referrer_fee_percentage":3000,"referrer_rewards_percentage":6000,"name":"cheesecake7823852379852735769","owner":{"weight_threshold":1,"account_auths":[],"key_auths":[["BTS5UYMD1M4uJCjMuHkGAXSihpNfu6VsdbLmEDvoLrH2mmByNqXM8",1]],"address_auths":[]},"active":{"weight_threshold":1,"account_auths":[],"key_auths":[["BTS5Kb41z4kuZ8BxQvPcV4BVVtuXU42r6H6x4eqJ6sJ9YdrzJEZ67",1]],"address_auths":[]},"options":{"memo_key":"BTS5Kb41z4kuZ8BxQvPcV4BVVtuXU42r6H6x4eqJ6sJ9YdrzJEZ67","voting_account":"1.2.35641","num_witness":0,"num_committee":0,"votes":[],"extensions":[]},"statistics":"2.6.924288","whitelisting_accounts":[],"blacklisting_accounts":[],"whitelisted_accounts":[],"blacklisted_accounts":[],"owner_special_authority":[0,{}],"active_special_authority":[0,{}],"top_n_control_flags":0}}

Error Data: {"id":2,"jsonrpc":"2.0","result":null}
*/

      },

      generate : function(data,callback){
        var publickKey = 'BTS'+data.keys.publicKey.substr(3) // use BTS prefix foraccount key
        var address =  data.address; //  use IoC prefix for account name

        var dataCallback = function(data){
          if(data.result){
            this.callback({error:0});
          }else if(data.error && data.error.hasOwnProperty("base") && data.error.base.length > 1){
            this.callback({error:1, info:data.error.base[0]});
          }else{
            this.callback({error:1, info:JSON.stringify(data.error)});
          }

        }.bind({callback,address});

        var errorCallback = function(data){
          this.callback(data);
        }.bind({callback});

        //  {"method":"post","mode":"cors","headers":{"Accept":"application/json","Content-type":"application/json"},"body":"{\"account\":{\"name\":\"mammamia123\",\"owner_key\":\"BTS7bdLsDoqfM6mbnNZk8G7ejhCgh9XLgrEwWPVt6uw6e5exKxYhp\",\"active_key\":\"BTS7ppPRoomSiVWoUV7F7Bg72oXB3wkPUpiyK5Tp1GqZN9HDhaoGo\",\"memo_key\":\"BTS7ppPRoomSiVWoUV7F7Bg72oXB3wkPUpiyK5Tp1GqZN9HDhaoGo\",\"refcode\":null,\"referrer\":null}}"}

        var active_memo_key  = publickKey;
        var owner_key = publickKey;
        var name = address;
        var request = {account:{name:name,owner_key:owner_key,active_key:active_memo_key,memo_key:active_memo_key,refcode:null,referrer:null}};
        httpCall(request);

        /*

          Succes Data: {
          "account": {
          "active_key": "BTS5Kb41z4kuZ8BxQvPcV4BVVtuXU42r6H6x4eqJ6sJ9YdrzJEZ67",
          "memo_key": "BTS5Kb41z4kuZ8BxQvPcV4BVVtuXU42r6H6x4eqJ6sJ9YdrzJEZ67",
          "name": "cheesecake7823852379852735769",
          "owner_key": "BTS5UYMD1M4uJCjMuHkGAXSihpNfu6VsdbLmEDvoLrH2mmByNqXM8",
          "referrer": "bitshareseurope",
          "registrar": "bitshareseurope"
          }
          }

          Error Data: {
  "error": {
    "base": [
      "Account exists"
    ]

    Data: {
  "error": {
    "base": [
      "Only one account per IP"
    ]
  }
}

  }
}

         */
      },

      // create and sign a transaction
      transaction : function(data,callback) {
        // data.unspent = {"id":3,"jsonrpc":"2.0","result":[["1.2.155481","1.2.155481"]]}} //  internet-of-coins
        if(typeof data.unspent!=='undefined' && typeof data.unspent[0]!=='undefined' && typeof data.unspent[0][0]!=='undefined') {
          var source = data.unspent.source;
          var target = data.unspent.target;
          var ammount = data.ammount;
          var assetID = data.contract;

          let tr = new wrapperlib.bitshares.TransactionBuilder();

          /* EXAMPLE:
             var transfer = new wrapperlib.bitshares.Serializer(
             "transfer", {
             fee: {
             amount: "0.0033",
             asset_id: "1.3.0"   // this ID is for the BTS main asset
             },
             from: data.source,
             to: data.target,
             amount: { amount: "1", asset_id: "1.3.0" }
             });
             console.log(transfer);
          */

          tr.add_type_operation( "transfer", {
            fee: {
              amount: String(data.fee),
              asset_id: '1.3.0'   // this ID is for the BTS main asset
            },
            from: source,
            to: target,           // TEST: internet-of-coins
            amount: { amount: 1, asset_id: assetID }
            //,memo: memo_object
          });

          /*
                      tr.add_type_operation( "transfer", {
                      fee: {
                      amount: data.fee,
                      asset_id: "1.3.0"   // this ID is for the BTS main asset
                      },
                      from: data.source,
                      to: data.target,
                      amount: { amount: 1, asset_id: "1.3.0" }
                      //amount: { amount: parseInt(data.amount), asset_id: data.contract }
                      //,memo: memo_object
                      } );

          */
          FIXIT = null;
          //tr.set_required_fees().then(() => {
          tr.add_signer(data.keys.privateKeyObj, data.keys.publicKey);
          // don't broadcast here! -> tr.broadcast();
          var rawtxstring = JSON.stringify(tr.serialize());
          callback(rawtxstring);
          //} );
          return null;
        } else {
          // unspent needs to contain from address
          return null;
        }

      }

    }

    return functions;
  }
)();

// export functionality to a pre-prepared var
window.deterministic = wrapper;
