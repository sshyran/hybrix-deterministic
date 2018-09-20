// (C) 2017 Internet of Coins / Metasync / Joachim de Koning
// hybridd module - waves/deterministic.js
// Deterministic encryption wrapper for Waves

function uglyClone(obj){return JSON.parse(JSON.stringify(obj));}

// Why this? When I rm it, stuff still works... Why update window object.
const randomBytes = crypto.randomBytes;
if (typeof window === 'object') {
  const wCrypto = window.crypto || {};
  if (!wCrypto.getRandomValues) {
    wCrypto.getRandomValues = function getRandomValues (arr) {
      const bytes = randomBytes(arr.length);
      for (var i = 0; i < bytes.length; i++) {
        arr[i] = bytes[i];
      }
    }
  }
}

var wrapperlib = require('./wrapperlib');

var wrapper = (
  function() {
    function bytesToHex(byteArray) {
      return Array.from(byteArray, function(byte) {
        return ('0' + (byte & 0xFF).toString(16)).slice(-2);
      }).join('')
    }

    function toSatoshi(amount, factor) {
      amount = new Decimal(amount);
      var toSatoshiFactor = new Decimal(10);
      var toSatoshiFactor = toSatoshiFactor.pow(factor)
      amount = amount.mul(toSatoshiFactor)
      return amount.toString();
    }

    function wavesPrice(asset1Amount, asset2Amount, asset2Factor) {
      var asset1Decimal = new Decimal(asset1Amount)
      var asset2Decimal = new Decimal(asset2Amount)
      var factorAsDecimal = new Decimal(10)
      factorAsDecimal = factorAsDecimal.pow(asset2Factor)

      return parseInt(asset2Decimal.mul(factorAsDecimal).div(asset1Decimal).toString())
    }

    function sortAssets(spendAssetId, receiveAssetId) {
      var orderedAssetPair = {}

      if (spendAssetId.length < receiveAssetId.length) {
        orderedAssetPair.asset1 = spendAssetId;
        orderedAssetPair.asset2 = receiveAssetId;
      } else if (spendAssetId.length > receiveAssetId.length) {
        orderedAssetPair.asset1 = receiveAssetId;
        orderedAssetPair.asset2 = spendAssetId;
      } else {
        var spendAssetIdDecoded = wrapperlib.base58.decode(spendAssetId);
        var receiveAssetIdDecoded = wrapperlib.base58.decode(receiveAssetId);

        if ( numericArrayCompare(spendAssetIdDecoded, receiveAssetIdDecoded) < 0 ) {
          orderedAssetPair.asset1 = spendAssetId;
          orderedAssetPair.asset2 = receiveAssetId;
        } else {
          orderedAssetPair.asset1 = receiveAssetId;
          orderedAssetPair.asset2 = spendAssetId;
        }
      }
      return orderedAssetPair;
    }

    function orderToHex(order) {
      function assetToHex(assetID) {
        if (assetID == "") {
          var assetAsHex = "00"
        }
        else {
          var assetAsHex = "01" + bytesToHex(wrapperlib.base58.decode(assetID))
        }
        return assetAsHex;
      }
      if (order.orderType == "buy") {
        var otype = "00"
      }
      else {
        var otype = "01"
      }

      return bytesToHex(wrapperlib.base58.decode(order.senderPublicKey))
                  + bytesToHex(wrapperlib.base58.decode(order.matcherPublicKey))
                  + assetToHex(order.assetPair.amountAsset)
                  + assetToHex(order.assetPair.priceAsset)
                  + otype
                  + order.price.toString(16).padStart(16, '0')
                  + order.amount.toString(16).padStart(16, '0')
                  + order.timestamp.toString(16).padStart(16, '0')
                  + order.expiration.toString(16).padStart(16, '0')
                  + order.matcherFee.toString(16).padStart(16, '0')

    }

  function signOrder(privkey, order, hexRandomSeed) {
    var orderAsHex = orderToHex(order)
    var privkeyAsByteArray = wrapperlib.base58.decode(privkey)
    var signedUint8Array = axlsign.sign(privkeyAsByteArray,
                              hexToBytes(orderAsHex),
                              hexToBytes(hexRandomSeed))
    return wrapperlib.base58.encode(signedUint8Array)
  }

    var functions = {
      makeSignedWavesOrder: function(data,callback) { //data = {spendAmount, receiveAmount, spendAsset, receiveAsset, matcherFee, maxLifetime, hexRandomSeed, matcherPublicKey, publickey, privKey}
        var currentTime = Date.now();

        var orderedAssetPair = sortAssets(data.spendAsset.contract, data.receiveAsset.contract);

        if (data.receiveAsset.contract == orderedAssetPair.asset1) {
          var orderType = "buy";
          var amount = toSatoshi(data.receiveAmount, data.receiveAsset.factor);
          var price =  wavesPrice(data.receiveAmount, data.spendAmount, data.spendAsset.factor);
        }
        else {
          var orderType = "sell";
          var amount = toSatoshi(data.spendAmount, data.spendAsset.factor);
          var price =  wavesPrice(data.spendAmount, data.receiveAmount, data.receiveAsset.factor);
        }


        order = {"signature": "",
                  "amount": amount,
                  "matcherPublicKey": data.matcherPublicKey,
                  "timestamp": currentTime,
                  "orderType": orderType,
                  "price": price,
                  "expiration": currentTime + (data.maxLifetime*1000),
                  "matcherFee": data.matcherFee,
                  "senderPublicKey": data.publickey,
                  "assetPair":
                  {
                    "amountAsset": orderedAssetPair.asset1,
                    "priceAsset": orderedAssetPair.asset2
                  }
                }
        console.log(order)
        order.signature = signOrder(data.privKey, order, data.hexRandomSeed);
        return order;
      }
    }
    return functions;
  }
)();

// export the functionality to a pre-prepared var
window.deterministic = wrapper;
