// (C) 2017 Internet of Coins / Joachim de Koning
// hybridd module - bitshares/deterministic.js
// Deterministic encryption wrapper for Bitshares

var wrapper = (
	function() {

    function toBtsPublic(prefix,publicKey) {
      var pub_buf = publicKey.toBuffer();
      var checksum = hash.ripemd160(pub_buf);
      var addy = Buffer.concat([pub_buf,checksum.slice(0,4)]);
      return prefix+base58.encode(addy);
    }
  
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
        return 'IoC-'+data.publicKey;
      },

      // create and sign a transaction
			transaction : function(data,callback) {
        
        let tr = new wrapperlib.bitshares.TransactionBuilder();

        if (data.mode != 'token') {

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
                  amount: 33,
                  asset_id: "1.3.0"   // this ID is for the BTS main asset
              },
              from: "1.2.15",
              to: "1.2.155481",       // TEST: internet-of-coins
              amount: { amount: 1, asset_id: "1.3.0" }
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
        }
        
        return '###';
			},

		}

		return functions;
	}
)();

// export functionality to a pre-prepared var
deterministic = wrapper;
