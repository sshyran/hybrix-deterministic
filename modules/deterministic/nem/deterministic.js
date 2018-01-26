// (C) 2018 Internet of Coins
// hybridd module - electrum/deterministic_source.js
// Deterministic encryption wrapper for NEM
//
// [!] Browserify this and save to deterministic.js.lzma to enable sending it from hybridd to the browser!
//

var wrapper = (
  function() {

    toSatoshis = function(float, factor) {
      return float * Math.pow(10, factor);
    }

    var functions = {
      // create deterministic public and private keys based on a seed
      keys : function(data) {
        var passphrase = data.seed;
        var privKey = wrapperlib.nem.crypto.helpers.derivePassSha(passphrase, 6000).priv;

        console.log("privKey: ", privKey);
        return { privateKey: privKey };
      },

      // generate a unique wallet address from a given public key
      address : function(data) {
        console.log("data.mode: ", data.mode);

        var privKey = data.keys.privateKey;
        var pubKey  = wrapperlib.nem.crypto.keyPair.create(privKey).publicKey;
        var network = wrapperlib.nem.model.network.data[data.mode]; // asset encoding?

        var addr = wrapperlib.nem.model.address.toAddress(pubKey, network);

        if (!wrapperlib.nem.model.address.isValid(addr)) {
          throw new Error("Can't generate address from private key. "
                             + "Generated address " + addr
                             + "is not valid");
        }
        if (!wrapperlib.nem.model.address.isFromNetwork(addr, network)) {
          throw new Error("Can't generate address from private key. "
                             + "Generated address " + addr
                             + "is not valid for " + network);
        }


        return addr;
      },

      transaction : function(data) {

// Note:
// Amounts are in the smallest unit possible in a prepared transaction object:

// 1000000 = 1 XEM

        var transferTransaction = wrapperlib.nem.model.objects.create("transferTransaction")(data.target, data.amount, data.message);

// {
//     "amount": 10,
//     "recipient": "TBCI2A67UQZAKCR6NS4JWAEICEIGEIM72G3MVW5S",
//     "recipientPublicKey": "",
//     "isMultisig": false,
//     "multisigAccount" : "",
//     "message": "Hello",
//     "isEncrypted" : false,
//     "mosaics": []
// }

        // nem.model.network.data.testnet.id =?= data.mode
        var common = wrapperlib.nem.model.objects.get("common");
        common.privateKey = data.keys.privateKey;
        var transactionEntity = wrapperlib.nem.model.transactions.prepare("transferTransaction")(common, transferTransaction, data.mode);


        // initialise keypair object based on private key
        var kp = wrapperlib.nem.crypto.keyPair.create(common.privateKey);
        // serialise transaction object
        var serialized = wrapperlib.nem.utils.serialization.serializeTransaction(transactionEntity);

        console.log("serialized: ", wrapperlib.nem.utils.convert.ua2hex(serialized));

        // sign serialised transaction
        var signature = kp.sign(serialized);

        // build result object
        var result = { 
                'data': wrapperlib.nem.utils.convert.ua2hex(serialized),
                'signature': signature.toString()
        };


        console.log("result: ", result);
        return result;
        // var privKey       = data.keys.privateKey;
        // var recipientAddr = wrapperlib.zcash.Address(data.target, data.mode);
        // var changeAddr    = wrapperlib.zcash.Address(data.source, data.mode);

        // var tx = new wrapperlib.zcash.Transaction()
        //   .from(data.unspent.unspents.map(function(utxo){
        //           return { txId:        utxo.txid,
        //                    outputIndex: utxo.txn,
        //                    address:     utxo.address,
        //                    script:      utxo.script,
        //                    satoshis:    toSatoshis(utxo.amount, data.factor)
        //                  };
        //         }))
        //   .to(recipientAddr, parseInt(data.amount))
        //   .fee(parseInt(data.fee))
        //   .change(changeAddr)
        //   .sign(privKey);

        // return tx.serialize();
      }
    }

    return functions;
  }
)();

// export the functionality to a pre-prepared var
deterministic = wrapper;
