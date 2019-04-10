//
// wrapperlib to include libraries for incorporation into the virtual DOM
//

// inclusion of necessary requires
let _keyPair = require('./nem-sdk/build/crypto/keyPair');
let _address = require('./nem-sdk/build/model/address');
let _address2 = _interopRequireDefault(_address);
let _convert = require('./nem-sdk/build/utils/convert');
let _convert2 = _interopRequireDefault(_convert);
let _format = require('./nem-sdk/build/utils/format');
let _format2 = _interopRequireDefault(_format);
// var _naclFast = require('./nem-sdk/build/external/nacl-fast');
// var _naclFast2 = _interopRequireDefault(_naclFast);
let _network = require('./nem-sdk/build/model/network');
let _network2 = _interopRequireDefault(_network);
let _cryptoHelpers = require('./nem-sdk/build/crypto/cryptoHelpers');
let _cryptoHelpers2 = _interopRequireDefault(_cryptoHelpers);
// var _helpers = require('./nem-sdk/build/utils/helpers');
// var _helpers2 = _interopRequireDefault(_helpers);
// var _nty = require('./nem-sdk/build/utils/nty');
// var _nty2 = _interopRequireDefault(_nty);
let _serialization = require('./nem-sdk/build/utils/serialization');
let _serialization2 = _interopRequireDefault(_serialization);
// var _transactionTypes = require('./nem-sdk/build/model/transactionTypes');
// var _transactionTypes2 = _interopRequireDefault(_transactionTypes);
// var _nodes = require('./nem-sdk/build/model/nodes');
// var _nodes2 = _interopRequireDefault(_nodes);
// var _sinks = require('./nem-sdk/build/model/sinks');
// var _sinks2 = _interopRequireDefault(_sinks);
// var _wallet = require('./nem-sdk/build/model/wallet');
// var _wallet2 = _interopRequireDefault(_wallet);
let _transactions = require('./nem-sdk/build/model/transactions');
let _transactions2 = _interopRequireDefault(_transactions);
let _objects = require('./nem-sdk/build/model/objects');
let _objects2 = _interopRequireDefault(_objects);
// var _requests = require('./nem-sdk/build/com/requests');
// var _requests2 = _interopRequireDefault(_requests);
let _fees = require('./nem-sdk/build/model/fees');
let _fees2 = _interopRequireDefault(_fees);
// var _cryptoJs = require('crypto-js');
// var _cryptoJs2 = _interopRequireDefault(_cryptoJs);
// var _websockets = require('./nem-sdk/build/com/websockets');
// var _websockets2 = _interopRequireDefault(_websockets);
// var _apostille = require('./nem-sdk/build/model/apostille');
// var _apostille2 = _interopRequireDefault(_apostille);

function _interopRequireDefault (obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let nemlibs = {
  nem: {
    crypto: {
      keyPair: {
        create: _keyPair.create
      },
      helpers: _cryptoHelpers2.default,
      // already injected: nacl: _naclFast2.default,
      // js: _cryptoJs2.default,
      verifySignature: _keyPair.verifySignature
    },
    model: {
      address: _address2.default,
      network: _network2.default,
      // nodes: _nodes2.default,
      // transactionTypes: _transactionTypes2.default,
      // sinks: _sinks2.default,
      // wallet: _wallet2.default,
      transactions: _transactions2.default,
      objects: _objects2.default,
      fees: _fees2.default
      // apostille: _apostille2.default
    },
    utils: {
      convert: _convert2.default,
      // helpers: _helpers2.default,
      // nty: _nty2.default,
      serialization: _serialization2.default,
      format: _format2.default
    }
  }
};

module.exports = nemlibs;
