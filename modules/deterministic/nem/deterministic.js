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

        return { privateKey: privKey };
      },

      // generate a unique wallet address from a given public key
      address : function(data) {
        console.log("data.mode: ", data.mode);

        var privKey = data.keys.privateKey;
        var pubKey  = wrapperlib.nem.crypto.keyPair.create(privKey).publicKey;
        var network = wrapperlib.nem.model.network.data[data.mode]; // asset encoding?

        console.log("network: ", network);

        var addr = wrapperlib.nem.model.address.toAddress(pubKey.toString(), network.id);

        if (!wrapperlib.nem.model.address.isValid(addr)) {
          throw new Error("Can't generate address from private key. "
                             + "Generated address " + addr
                             + "is not valid");
        }
        if (!wrapperlib.nem.model.address.isFromNetwork(addr, network.id)) {
          throw new Error("Can't generate address from private key. "
                             + "Generated address " + addr
                             + "is not valid for " + network);
        }
        if (!wrapperlib.nem.crypto.helpers.checkAddress(privKey, network.id, addr)) {
          throw new Error("Private key doesn't correspond to the expected address " + addr);
        }

        return addr;
      },

      transaction : function(data) {
        var network = wrapperlib.nem.model.network.data[data.mode]; // asset encoding?

        var transferTransaction = wrapperlib.nem.model.objects.create("transferTransaction")(data.target, data.amount, data.message);
        console.log("transferTransaction: ", transferTransaction);

        var common = wrapperlib.nem.model.objects.get("common");
        common.privateKey = data.keys.privateKey;
        var transactionEntity = wrapperlib.nem.model.transactions.prepare("transferTransaction")(common, transferTransaction, network.id);
        console.log("transactionEntity: ", transactionEntity);

// Note:
// Amounts are in the smallest unit possible in a prepared transaction object:
// 1000000 = 1 XEM

        // initialise keypair object based on private key
        var kp = wrapperlib.nem.crypto.keyPair.create(common.privateKey);
        // serialise transaction object
        var serialized = wrapperlib.nem.utils.serialization.serializeTransaction(transactionEntity);
        // sign serialised transaction
        var signature = kp.sign(serialized);

        // build result object
        var result = { 
          'data': wrapperlib.nem.utils.convert.ua2hex(serialized),
          'signature': signature.toString()
        };

        return result;
      }
    }

    return functions;
  }
)();

// export the functionality to a pre-prepared var
deterministic = wrapper;
