// (C) 2018 Internet of Coins
// Deterministic encryption wrapper for Counterparty
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
        // return deterministic transaction data
        var seed = new Buffer(data.seed);
        var hash = wrapperlib.bitcore.crypto.Hash.sha256(seed);
        var bn   = wrapperlib.bitcore.crypto.BN.fromBuffer(hash);

        var privKey = new wrapperlib.bitcore.PrivateKey(bn, data.mode);
        var wif     = privKey.toWIF();

        return { WIF: wif };
      },

      // generate a unique wallet address from a given public key
      address : function(data) {

        var privKey = wrapperlib.bitcore.PrivateKey(data.WIF, data.mode);
        var addr    = privKey.toAddress();

        if (!wrapperlib.bitcore.Address.isValid(addr, data.mode)) {
          throw new Error("Can't generate address from private key. "
                             + "Generated address " + addr
                             + "is not valid for " + data.mode);
        }

        return addr.toString();
      },

      transaction : function(data) {

        var privKey = wrapperlib.bitcore.PrivateKey(data.keys.WIF, data.mode);
        //console.log(privKey.toAddress(NETWORK).toString());
        
        if(typeof data.unspent.unsignedtx==='string') {
          
          // parse the hex transaction to bitcore
          tx = new wrapperlib.bitcore.Transaction(data.unspent.unsignedtx)
            .from(data.unspent.unspents.map(function(utxo){
                      return { txId:        utxo.txid,
                               outputIndex: utxo.txn,
                               address:     data.source,
                               script:      utxo.script,
                               satoshis:    parseInt(toSatoshis(utxo.amount,data.factor))
                             };
                    }))
            .sign(privKey)

          return tx.serialize();

        } else {
          
          // normal Bitcoin transaction
          var privKey       = wrapperlib.bitcore.PrivateKey(data.keys.WIF, data.mode);
          var recipientAddr = wrapperlib.bitcore.Address(data.target, data.mode);
          var changeAddr    = wrapperlib.bitcore.Address(data.source, data.mode);

          var tx = new wrapperlib.bitcore.Transaction()
            .from(data.unspent.unspents.map(function(utxo){
                    return { txId:        utxo.txid,
                             outputIndex: utxo.txn,
                             address:     utxo.address,
                             script:      utxo.script,
                             satoshis:    parseInt(toSatoshis(utxo.amount,data.factor))
                           };
                  }))
            .to(recipientAddr, parseInt(data.amount))
            .fee(parseInt(data.fee))
            .change(changeAddr)
            .sign(privKey);

          return tx.serialize();

        }

      }
    }

    return functions;
  }
)();

// export the functionality to a pre-prepared var
deterministic = wrapper;
