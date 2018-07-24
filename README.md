# module-deterministic
Deterministic module for hybridd


a deterministic module $NAME consists of the following tree

module-deterministic/modules/deterministic/$NAME/

- deterministic.js               the main module code.
- wrapperlib.js                   the first wrapper library
- Optional: more scripts    more wrapper libraries etc.
- compile.sh                      a script to compile the above into a single lmza file
- deterministic.js.lmza       the lmza blob file

deterministic.js   must contain three functions: `keys`, `address` and
`transaction`.
It can optionally contain a `validate` and `generate` function.

```
var wrapper = (
  function() {

    var functions = {
      // create deterministic public and private keys based
      keys : function(data) {
        // data = {seed: .. , ??? }
        // compute key pair, private key, or wif
        return { WIF: wif } or {privateKey:...} or {privateKey: ...,
      publicKey: ...} // = $KEYS object
      },

      // generate a unique wallet address from a given public key
      address : function(data) {
        // data = {seed: .. , keys: $KEYS, mode: $NAME/$MODE, ...???}
        // compute addr
        return addr; // TODO a string or a buffer???
        },

      validate : function(address,callback){}

      generate : function(data,callback){}

      transaction : function(data,callback) {
      /* data = {
      keys: $KEYS,
      symbol:,
      source: ,
      target: ,
      account:,
      fee:,
      factor:,
      contract:,
      unspent:,
      target,
      ammount
      }
      */


        // compute signedMessaged
        return signedMessaged; // the signed message serialized into a string
      }
    }

    return functions;
  }
)();

// export the functionality to a pre-prepared var
deterministic = wrapper;
```
