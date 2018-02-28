// (C) 2018 Internet of Coins
// hybridd module - waves/deterministic_source.js
// Deterministic encryption wrapper for Waves
//
// [!] Browserify this and save to deterministic.js.lzma to enable sending it from hybridd to the browser!
//

// https://github.com/wavesplatform/curve25519-js

var wrapper = (
  function() {

    var functions = {
      // create deterministic public and private keys based on a seed
      keys : function(data) {
        var seed = new Buffer(data.seed);
        var keyPair = wrapperlib.axlsign.generateKeyPair(seed);
        return {privateKey: keyPair.private, publicKey:keyPair.public };
      },
               
      // generate a unique wallet address from a given public key
      // https://github.com/wavesplatform/Waves/wiki/Data-Structures#address
      address : function(data) {
        var secureHash = data => Keccak256(Blake2b256(data));//TODO  where to find them, for now assume they work on buffers
        var version = Buffer.from([0x01]);
        var addressScheme = Buffer.from([0x57]); // (0x57 for Mainnet , 0x54 for Testnet)
        var publicKeyHash = secureHash(Buffer.from(data.keys.publicKey,'utf8')).slice(0,20);
        var buffer = Buffer.concat([version,adressScheme,publicKeyHash]);
        var checksum = secureHash(buffer);
        var addr = Buffer.concat([buffer,checksum]).toString('utf8');
        return addr;
      },

      transaction : function(data) {
        var message = {
               type: 4,
               sender: data.source,
               recipient: data.target,
               amount: parseInt(data.amount),
               fee: parseInt(data.fee),
               attachment: 'string' //TODO what does this do??
               };
               
        var signedMessage = signMessage(data.keys.privateKey, message, [random]); //TODO get a proper random number
        return signMessage.serialize();
      }
    }

    return functions;
  }
)();

// export the functionality to a pre-prepared var
deterministic = wrapper;
