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
      
      asset2Decimal.mul(factorAsDecimal).div(asset1Decimal)
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
        var spendAssetIdDecoded = base58.decode(spendAssetId);
        var receiveAssetIdDecoded = base58.decode(receiveAssetId);
        
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

    var functions = {
      makeSignedWavesOrder: function(data,callback) { //data = {spendAmount, receiveAmount, spendAsset, receiveAsset, matcherFee, maxLifetime, hexRandomSeed, matcherPublicKey, publickey, privKey}
        var currentTime = Date.now();
        
        var orderedAssetPair = sortAssets(spendAssetId, receiveAssetId);
        
        if (receiveAssetId == orderedAssetPair.asset1) {
          var orderType = "buy"; 
          var amount = toSatoshi(receiveAmount, receiveAsset.factor);
          var price =  wavesPrice(receiveAmount, spendAmount, spendAsset.factor);
        }
        else {
          var orderType = "sell";
          var amount = toSatoshi(spendAmount, spendAsset.factor);
          var price =  wavesPrice(spendAmount, receiveAmount, receiveAsset.factor);
        }
        
        
        order = {"signature": "",
                  "amount": amount,
                  "matcherPublicKey": matcherPublicKey,
                  "timestamp": currentTime,
                  "orderType": orderType,
                  "price": price,
                  "expiration": currentTime + (maxLifetime*1000),
                  "matcherFee": matcherFee,
                  "senderPublicKey": publickey,
                  "assetPair":
                  {
                    "amountAsset": orderedAssetPair.asset1,
                    "priceAsset": orderedAssetPair.asset2
                  }
                }
        console.log(order)
        order.signature = signOrder(privKey, order, hexRandomSeed);
        return order;
      }
    }
    return functions;
  }
)();

// export the functionality to a pre-prepared var
window.deterministic = wrapper;
