// (C) 2017 Internet of Coins / Joachim de Koning
// hybridd module - bitshares/deterministic.js
// Deterministic encryption wrapper for Bitshares

/*

create account: mammamia123
WalletActions.js:86 new active pubkey BTS7ppPRoomSiVWoUV7F7Bg72oXB3wkPUpiyK5Tp1GqZN9HDhaoGo
WalletActions.js:87 new owner pubkey BTS7bdLsDoqfM6mbnNZk8G7ejhCgh9XLgrEwWPVt6uw6e5exKxYhp
WalletActions.js:108 >>>> Host: https://faucet.bitshares.eu/onboarding
WalletActions.js:110 >>>> Request: {"method":"post","mode":"cors","headers":{"Accept":"application/json","Content-type":"application/json"},"body":"{\"account\":{\"name\":\"mammamia123\",\"owner_key\":\"BTS7bdLsDoqfM6mbnNZk8G7ejhCgh9XLgrEwWPVt6uw6e5exKxYhp\",\"active_key\":\"BTS7ppPRoomSiVWoUV7F7Bg72oXB3wkPUpiyK5Tp1GqZN9HDhaoGo\",\"memo_key\":\"BTS7ppPRoomSiVWoUV7F7Bg72oXB3wkPUpiyK5Tp1GqZN9HDhaoGo\",\"refcode\":null,\"referrer\":null}}"}

*/

var wrapper = (
  function() {

    var functions = {

      // create deterministic public and private keys based on a seed
      keys : function(data) {
        var privateKeyObj = wrapperlib.bitshares.PrivateKey.fromSeed( wrapperlib.bitshares.key.normalize_brainKey(data.seed) );
        // console.log("\nPrivate key:", privateKey.toWif());
        var privateKey = privateKeyObj.toWif();
        var publicKey = privateKeyObj.toPublicKey().toString();
        return {privateKeyObj:privateKeyObj,privateKey:privateKey,publicKey:publicKey};
      },

      // generate a unique wallet address from a given public key
      address : function(data) {
        return '[UNDER MAINTENANCE]';
        //return 'IoC'+data.publicKey.substr(3); //replace GPH with IOC (later to be replaced with BTS
      },

      // create and sign a transaction
      transaction : function(data,callback) {
        // data.unspent = {"id":3,"jsonrpc":"2.0","result":[["1.2.155481","1.2.155481"]]}} //  internet-of-coins
        if(typeof data.unspent!=='undefined' && typeof data.unspent[0]!=='undefined' && typeof data.unspent[0][0]!=='undefined') {
          var source = data.unspent.source;
          var target = data.unspent.target;

          let tr = new wrapperlib.bitshares.TransactionBuilder();

          if (data.mode !== 'token') {
            assetID = '1.3.0';
          }

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

        } else {
          // unspent needs to contain from address
          return null;
        }

      },

    }

    return functions;
  }
)();

// export functionality to a pre-prepared var
deterministic = wrapper;
