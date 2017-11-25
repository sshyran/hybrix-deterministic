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
                return wrapperlib.publicKeyToAccountId(data.publicKey);
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
