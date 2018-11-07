# module-deterministic
Deterministic module for hybridd

**Purpose**

A deterministic module is a client side module for hybridd. It is used
to handle client seeds, keys addresses and signing. As we
do not want a client to share their keys all these actions should be
performed client side. The node should never touch this data.
To facilitate this the node supplies a 'client code blob' : compressed
javascript code that can be executed on the client side.

**Types**

Most client side modules will be asset modules. For example the client
module `bitcoinjslib` to handle bitcoin key and address generation and transaction signing.
Other custom client side modules can also be provided. For example to
provide connectivity to (decentralized) exchanges.

**Source Files**

The source files for deterministic modules with name `$MY_ASSET_NAME` are grouped in the module folder

`$HYBRIDD/deterministic/modules/$MY_ASSET_NAME/`

You will need to create the following file(s):

- `deterministic.js`              The entry file see below for the deterministic.js template

- [Optional]: `precompile.sh`         A script to standardize and
  automate changes to third party libraries.
- [Optional]: `compile.sh`            a script to compile the above into a single lmza file

The artifact (compilation result) is build in the
`$HYBRIDD/deterministic/dist/$MY_ASSET_NAME/` folder. It will consist of a lmza
compressed code blob file named `deterministic.js.lmza`


**Grocery List**

To implement a deterministic module you will need the following

1) Node Side Module

A qrtz module added to the `$HYBRIDD/node/recipes` folder.
This should provide a connection to the asset API's (for example: the block
explorers) Handling queries for balance, unspents and pushing transactions.

2) A javascript library for the asset.

A library provided by the developers of the crypto currency. This can
be a npm module or  a (minified) web js library. Search online for
" $MY_ASSET_NAME javascript library" this will very likely guide you
to a github repository or npm module which you can download.

To install npm modules: please use supplied npm:

```
cd $HYBRIDD/deterministic
node_binaries/bin/npm i $MY_ASSETS_NPM_MODULE
```

To then include the npm module in your `deterministic.js`:

```
var myAssetLib = require("$MY_ASSETS_NPM_MODULE")
```

To include a js library file:

Place the file in the module folder:
`$HYBRIDD/deterministic/modules/$MY_ASSET_NAME/$MY_ASSET_LIBRARY/$SOME_FILE.js`

To then include the js library in your `deterministic.js`:

```
var myAssetLib = require("$MY_ASSET_LIBRARY/$SOME_FILE")
```

**Deterministic.js Template**

`deterministic.js` must provide three functions: `keys`, `address` and
`transaction`.
It can optionally provide a `validate` and `generate` function.


```
var wrapperlib = require("$MY_ASSET_LIBRARY/$SOME_FILE")

var wrapper = (
  function() {

    var functions = {
      // create deterministic public and private keys based
      keys : function(data) {
         return wrapperLib.someFunctionToCreateKeysFromSeed(data.seed);
      },

      // generate a unique wallet address from a given public key
      address : function(data) {
         return wrapperLib.someFunctionToGenerateAddressFromKeys(data.keys);
      },

      // create and sign a transaction for the given keys, amount,
      addresses and fees
      transaction : function(data,callback) {
          // contruct a transaction object
          var tx = {
            amount: data.amount
            fee:data.fee
            targetaddress: data.target
            sourceaddress: data.source
            fee: data.fee
          };

          return
          wrapperLib.someFunctionToSignTransaction(tx,data.keys);

          // If the function is asynchronious then use
          // wrapperLib.someAsyncFunctionToSignTransaction(tx,data.keys,callback);
      }

      [Optional: validate : function(address,callback){...}]

      [Optional: generate : function(data,callback){...}]

    }

    return functions;
  }
)();

// export the functionality to a pre-prepared var
window.deterministic = wrapper;
```

The `keys' function expects a data parameter containig the seed
property and returns an keys object with a key.

```
keys : function({seed: ..}){
        return  {privateKey:...}; // or {privateKey: ...,
        publicKey: ...} or { WIF: wif }
      }
      ```

The `address` function expects a data parameter containing the seed,
the keys, and the mode. (The mode is used to distinguish between
assets using the same deterministic module. For example
bitcoinjslib.bitcoin and bitcoinjslib.omni) It returns a string
containing the address

```
address : function({seed: .. , keys: ..., mode: ...}){
  return "ABC123";
}
```

The `transaction` function expects a data parameter of the following
format:

```
{
      keys:
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
```

and an optional callback parameter in case the transaction generation
is asynchronious. The function will return the stringified signed transaction.


**Compilation**
All deterministic modules (which source files are modified more recent
than the corresponding lmza) are compiled by executing:

`$HYBRIDD/deterministic/npm run build`

**Testing**

TODO

**Pipeline**
The following steps are performed to create the client code blob:

- [Optional] Precompile : automatic modification are made to third
party libraries.
- Compile:
- - Degloballify:  All global/undeclared variables 'x' are declared as
'window.x'
- - Webpack : create a package that can be used by browsers
- - Compress : compress the result using lmza

**Precompile**
The precompile step is only executed if there's a precompile.sh
present in the module folder. This can and should be used to make modification to third
party libraries (which is sometimes required). We do not want to make
these modification in the libraries statically because then our
changes will be lost if we update the libraries. By adding the code in
precompile.sh the changes will be reapplied after code updates.

**Compile override**
To override the compile script place a compile.sh script of your own
making in the module folder.
