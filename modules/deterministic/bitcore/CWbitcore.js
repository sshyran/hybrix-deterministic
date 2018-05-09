/*
 *    Counterparty Wrapper for Bitcore
 *    wrapped for IoC modules-deterministic by Agent725
 */

var CWbitcore = (function() {

    var async = require('async');

/*
    var CWPrivateKey = function(priv) {
      this.priv = null;
      this.init(priv);
    }

    CWPrivateKey.prototype.init = function(priv) {
      try {
        if (typeof priv === "string") {
          priv = wrapperlib.bitcore.PrivateKey(priv, NETWORK);
        }
        this.priv = priv;
      } catch (err) {
        this.priv = null;
      }
    }

    CWPrivateKey.prototype.getAddress = function() {
      return this.priv.toAddress(NETWORK).toString();
    }

    CWPrivateKey.prototype.checkTransactionDest = function(txHex, destAdress) {
      checkArgsType(arguments, ["string", "object"]);
      try {
        return CWBitcore.checkTransactionDest(txHex, this.getAddresses(), destAdress);
      } catch (err) {
        return false;
      }
    }
*/

    /**
     *
     * @param {string} unsignedHex
     * @param {CWPrivateKey} cwPrivateKey
     * @param {boolean|function} [disableIsFullySigned]
     * @param {function} cb
     * @returns {*}
     */
    function assert(condition, message) {
      if (!condition) throw Error(message?message:"Assertion failed: "+condition);
    }

    function checkArgType(arg, type) {
      assert((typeof arg).toLowerCase() == type.toLowerCase(), "Invalid argument type");
    }

    function checkArgsType(args, types) {
      for (var a = 0; a < args.length; a++) {
        checkArgType(args[a], types[a]);
      }
    }

    var CWBitcore = {};

    CWBitcore.genKeyMap = function(cwPrivateKeys) {
      var wkMap = {};
      cwPrivateKeys.forEach(function(cwPrivateKey) {
        var address = cwPrivateKey.toAddress(NETWORK).toString();
        // DEBUG: console.log(' A:'+address+' P:'+cwPrivateKey);
        wkMap[address] = cwPrivateKey;
      });

      return wkMap;
    }

    CWBitcore.MultisigAddressToAddresses = function(val) {

      if (CWBitcore.isValidAddress(val)) {
        return [val];
      } else if (CWBitcore.isValidMultisigAddress(val)) {
        var addresses = val.split("_");
        addresses.shift();
        addresses.pop();

        return addresses;
      } else {
        return [];
      }
    }

    CWBitcore.isValidAddress = function(val) {
      try {
        return wrapperlib.bitcore.Address.isValid(val, NETWORK, wrapperlib.bitcore.Address.Pay2PubKeyHash);
      } catch (err) {
        return false;
      }
    }

    CWBitcore.isValidMultisigAddress = function(val) {
      try {
        var addresses = val.split("_");
        if (addresses.length != 4 && addresses.length != 5) {
          return false;
        }
        var required = parseInt(addresses.shift());
        var provided = parseInt(addresses.pop());
        if (isNaN(required) || isNaN(provided) || provided != addresses.length || required > provided || required < 1) {
          return false;
        }
        for (var a = 0; a < addresses.length; a++) {
          if (!CWBitcore.isValidAddress(addresses[a])) {
            return false;
          }
        }
        return true;
      } catch (err) {
        return false;
      }
    }

    /**
     * @TODO: check the pubkey instead
     *
     * @param {string}    txHex
     * @param {string[]}  source  list of compressed and uncompressed addresses
     * @param {string[]}  dest
     * @returns {boolean}
     */
    CWBitcore.checkTransactionDest = function(txHex, source, dest) {
      checkArgsType(arguments, ["string", "object", "object"]);

      source = [].concat.apply([], source.map(function(source) {
        return CWBitcore.MultisigAddressToAddresses(source);
      }));
      dest = [].concat.apply([], dest.map(function(dest) {
        return CWBitcore.MultisigAddressToAddresses(dest);
      }));

      var tx = wrapperlib.bitcore.Transaction(txHex);

      var outputsValid = tx.outputs.map(function(output, idx) {
        var address = null;

        switch (output.script.classify()) {
          case wrapperlib.bitcore.Script.types.PUBKEY_OUT:
            address = output.script.toAddress(NETWORK).toString();
            break;

          case wrapperlib.bitcore.Script.types.PUBKEYHASH_OUT:
            address = output.script.toAddress(NETWORK).toString();
            break;

          case wrapperlib.bitcore.Script.types.SCRIPTHASH_OUT:
            address = output.script.toAddress(NETWORK).toString();
            break;

          case wrapperlib.bitcore.Script.types.MULTISIG_OUT:
            var addresses = CWBitcore.extractMultiSigAddressesFromScript(output.script);

            var isSource = dest.sort().join() == addresses.sort().join();
            var isDest = source.sort().join() == addresses.sort().join();

            // if multisig we only accept it if it's value indicates it's a data output (<= MULTISIG_DUST_SIZE or <= REGULAR_DUST_SIZE*2)
            //  or a perfect match with the dest or source (change)
            return output.satoshis <= Math.max(MULTISIG_DUST_SIZE, REGULAR_DUST_SIZE * 2) || isSource || isDest;

          case wrapperlib.bitcore.Script.types.DATA_OUT:
            return true;

          default:
            throw new Error("Unknown type [" + output.script.classify() + "]");
        }

        function intersection(arr, obj) {
          for(var i=0; i<arr.length; i++) {
              if (arr[i] == obj) return true;
          }
        }
        var containsSource = intersection(source,address);
        var containsDest = intersection(dest,address);
        // DEPRECATED
        //var containsSource = _.intersection([address], source).length > 0;
        //var containsDest = _.intersection([address], dest).length > 0;

        return containsDest || containsSource;
      });

      return outputsValid.filter(function(v) { return !v; }).length === 0;
    }

    CWBitcore.signRawTransaction = function(unsignedHex, cwPrivateKey, disableIsFullySigned, cb) {
      // make disableIsFullySigned optional
      if (typeof disableIsFullySigned === "function") {
        cb = disableIsFullySigned;
        disableIsFullySigned = null;
      }
      checkArgType(unsignedHex, "string");
      checkArgType(cwPrivateKey, "object");
      checkArgType(cb, "function");
      
      try {
        var tx = wrapperlib.bitcore.Transaction(unsignedHex);

        var keyMap = CWBitcore.genKeyMap([cwPrivateKey]);
        var keyChain = [];

        async.forEachOf(
          tx.inputs,
          function(input, idx, cb) {
            (function(cb) {
              var inputObj;

              // dissect what was set as input script to use it as output script
              var script = wrapperlib.bitcore.Script(input._scriptBuffer.toString('hex'));
              var multiSigInfo;
              var addresses = [];

              switch (script.classify()) {
                case wrapperlib.bitcore.Script.types.PUBKEY_OUT:
                  inputObj = input.toObject();
                  inputObj.output = wrapperlib.bitcore.Transaction.Output({
                    script: input._scriptBuffer.toString('hex'),
                    satoshis: 0 // we don't know this value, setting 0 because otherwise it's going to cry about not being an INT
                  });
                  tx.inputs[idx] = new wrapperlib.bitcore.Transaction.Input.PublicKey(inputObj);

                  addresses = [script.toAddress(NETWORK).toString()];

                  return cb(null, addresses);

                case wrapperlib.bitcore.Script.types.PUBKEYHASH_OUT:
                  inputObj = input.toObject();
      console.log(' InputObj '+JSON.stringify(inputObj));
                  inputObj.output = wrapperlib.bitcore.Transaction.Output({
                    script: input._scriptBuffer.toString('hex'),
                    satoshis: 0 // we don't know this value, setting 0 because otherwise it's going to cry about not being an INT
                  });
                  tx.inputs[idx] = new wrapperlib.bitcore.Transaction.Input.PublicKeyHash(inputObj);

                  addresses = [script.toAddress(NETWORK).toString()];
      console.log(' CONTINUE... '+addresses);

                  return cb(null, addresses);

                case wrapperlib.bitcore.Script.types.MULTISIG_IN:
                  inputObj = input.toObject();

                  return failoverAPI(
                    'get_script_pub_key',
                    {tx_hash: inputObj.prevTxId, vout_index: inputObj.outputIndex},
                    function(data) {
                      inputObj.output = wrapperlib.bitcore.Transaction.Output({
                        script: data['scriptPubKey']['hex'],
                        satoshis: wrapperlib.bitcore.Unit.fromBTC(data['value']).toSatoshis()
                      });

                      multiSigInfo = CWBitcore.extractMultiSigInfoFromScript(inputObj.output.script);

                      inputObj.signatures = wrapperlib.bitcore.Transaction.Input.MultiSig.normalizeSignatures(
                        tx,
                        new wrapperlib.bitcore.Transaction.Input.MultiSig(inputObj, multiSigInfo.publicKeys, multiSigInfo.threshold),
                        idx,
                        script.chunks.slice(1, script.chunks.length).map(function(s) { return s.buf; }),
                        multiSigInfo.publicKeys
                      );

                      tx.inputs[idx] = new wrapperlib.bitcore.Transaction.Input.MultiSig(inputObj, multiSigInfo.publicKeys, multiSigInfo.threshold);

                      addresses = CWBitcore.extractMultiSigAddressesFromScript(inputObj.output.script);

                      return cb(null, addresses);
                    }
                  );

                case wrapperlib.bitcore.Script.types.MULTISIG_OUT:
                  inputObj = input.toObject();
                  inputObj.output = wrapperlib.bitcore.Transaction.Output({
                    script: input._scriptBuffer.toString('hex'),
                    satoshis: 0 // we don't know this value, setting 0 because otherwise it's going to cry about not being an INT
                  });

                  multiSigInfo = CWBitcore.extractMultiSigInfoFromScript(inputObj.output.script);
                  tx.inputs[idx] = new wrapperlib.bitcore.Transaction.Input.MultiSig(inputObj, multiSigInfo.publicKeys, multiSigInfo.threshold);

                  addresses = CWBitcore.extractMultiSigAddressesFromScript(inputObj.output.script);

                  return cb(null, addresses);

                case wrapperlib.bitcore.Script.types.SCRIPTHASH_OUT:
                  // signing scripthash not supported, just skipping it, something external will have to deal with it
                  return cb();

                case wrapperlib.bitcore.Script.types.DATA_OUT:
                case wrapperlib.bitcore.Script.types.PUBKEY_IN:
                case wrapperlib.bitcore.Script.types.PUBKEYHASH_IN:
                case wrapperlib.bitcore.Script.types.SCRIPTHASH_IN:
                  // these are 'done', no reason to touch them!
                  return cb();

                default:
                  return cb(new Error("Unknown scriptPubKey [" + script.classify() + "](" + script.toASM() + ")"));
              }

            })(function(err, addresses) {
              if (err) {
                return cb(err);
              }

              // NULL means it isn't neccesary to sign it
              if (addresses === null) {
                return cb();
              }

              // unique filter
              addresses = addresses.filter(function(address, idx, self) {
                return address && self.indexOf(address) === idx;
              });

              var _keyChain = addresses.map(function(address) {
                return typeof keyMap[address] !== "undefined" ? keyMap[address] : null;
              }).filter(function(key) {
                return !!key
              });

              if (_keyChain.length === 0) {
                throw new Error("Missing private key to sign input: " + idx);
              }

              keyChain = keyChain.concat(_keyChain);

              cb();
            });
          },
          function(err) {
            if (err) {
              // async.nextTick to avoid parent trycatch
              return async.nextTick(function() {
                cb(err);
              });
            }

            // unique filter
            keyChain = keyChain.filter(function(key, idx, self) {
              return key && self.indexOf(key) === idx;
            });

            // sign with each key
            keyChain.forEach(function(priv) {
              tx.sign(priv);
            });

            // disable any checks that have anything to do with the values, because we don't know the values of the inputs
            var opts = {
              disableIsFullySigned: disableIsFullySigned,
              disableSmallFees: true,
              disableLargeFees: true,
              disableDustOutputs: true,
              disableMoreOutputThanInput: true
            };

            // async.nextTick to avoid parent trycatch
            async.nextTick(function() {
              cb(null, tx.serialize(opts));
            });
          }
        );
      } catch (err) {
        // async.nextTick to avoid parent trycatch
        async.nextTick(function() {
          cb(err);
        });
      }
    };

  return CWBitcore;

})();

if (typeof define === 'function' && define.amd) {
  define(function () { return CWbitcore; });
} else if( typeof module !== 'undefined' && module != null ) {
  module.exports = CWbitcore;
} else if( typeof angular !== 'undefined' && angular != null ) {
  angular.module('CWbitcore', [])
  .factory('CWbitcore', function () {
    return CWbitcore;
  });
}
