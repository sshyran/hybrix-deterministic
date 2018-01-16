// (C) 2017 Internet of Coins / Metasync / Joachim de Koning
// hybridd module - ethereum/deterministic.js
// Deterministic encryption wrapper for NXT

var wrapper = (
    function() {

        var functions = {

            // create deterministic public and private keys based on a seed
            keys: function(data) {
                var publicKey = wrapperlib.secretPhraseToPublicKey(data.seed);
                // simply pass the unique seed as secret phrase to the NXT library
                return {
                    publicKey: publicKey,
                    secretPhrase: data.seed
                };
            },

            // generate a unique wallet address from a given public key
            address: function(data) {
                var address = wrapperlib.publicKeyToAccountId(data.keys.publicKey);
                var output = null;
                switch (data.mode) {
                  case 'burst':
                    output = 'BURST'+address.substr(3);
                  break;
                  case 'burst-token':
                    output = 'BURST'+address.substr(3);
                  break;
                  case 'elastic':
                    output = 'XEL'+address.substr(3);
                  break;
                  case 'elastic-token':
                    output = 'XEL'+address.substr(3);
                  break;
                  default:
                    output = address;
                  break;
                }
                return output;
            },

            transaction: function(data) {
                if(typeof data.unspent.unsignedTransactionBytes!=='undefined') {
                  return wrapperlib.signTransactionBytes(data.unspent.unsignedTransactionBytes, data.keys.secretPhrase);
                } else {
                  return null;
                }
            },

        }

        return functions;
    }
)();

// export the functionality to a pre-prepared var
deterministic = wrapper;
