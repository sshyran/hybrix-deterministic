// (C) 2017 Internet of Coins / Joachim de Koning
// hybridd module - bitshares/deterministic.js
// Deterministic encryption wrapper for Bitshares

var wrapper = (
	function() {

		var functions = {
          
			// create deterministic public and private keys based on a seed
			keys : function(data) {        
        var privateKey = wrapperlib.bitshares.PrivateKey.fromSeed( wrapperlib.bitshares.key.normalize_brainKey(data.seed) );
        // console.log("\nPrivate key:", privateKey.toWif());
        return {privateKey:privateKey};
			},

      // generate a unique wallet address from a given public key
      address : function(data) {
        return data.privateKey.toPublicKey().toString();
      },

      // create and sign a transaction
			transaction : function(data) {
        
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
                  amount: "0033",
                  asset_id: "1.3.0"   // this ID is for the BTS main asset
              },
              from: data.source,
              to: data.target,
              amount: { amount: "1", asset_id: "1.3.0" }
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

/*
          tr.set_required_fees().then(() => {
              tr.add_signer(data.keys.privateKey, data.keys.privateKey.toPublicKey().toString());
              console.log("serialized transaction:", tr.serialize());
              // don't broadcast here! -> tr.broadcast();
          } );  */

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
