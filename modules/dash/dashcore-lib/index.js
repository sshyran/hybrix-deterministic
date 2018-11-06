'use strict';

var poliscore = module.exports;

// module information
poliscore.version = 'v' + require('./package.json').version;
poliscore.versionGuard = function(version) { return;
  if (version !== undefined) {
    var message = 'More than one instance of poliscore-lib found. ' +
      'Please make sure to require poliscore-lib and check that submodules do' +
      ' not also include their own poliscore-lib dependency.';
    throw new Error(message);
  }
};
poliscore.versionGuard(global._poliscore);
global._poliscore = poliscore.version;

// crypto
poliscore.crypto = {};
poliscore.crypto.BN = require('./lib/crypto/bn');
poliscore.crypto.ECDSA = require('./lib/crypto/ecdsa');
poliscore.crypto.Hash = require('./lib/crypto/hash');
poliscore.crypto.Random = require('./lib/crypto/random');
poliscore.crypto.Point = require('./lib/crypto/point');
poliscore.crypto.Signature = require('./lib/crypto/signature');

// encoding
poliscore.encoding = {};
poliscore.encoding.Base58 = require('./lib/encoding/base58');
poliscore.encoding.Base58Check = require('./lib/encoding/base58check');
poliscore.encoding.BufferReader = require('./lib/encoding/bufferreader');
poliscore.encoding.BufferWriter = require('./lib/encoding/bufferwriter');
poliscore.encoding.Varint = require('./lib/encoding/varint');

// utilities
poliscore.util = {};
poliscore.util.buffer = require('./lib/util/buffer');
poliscore.util.js = require('./lib/util/js');
poliscore.util.preconditions = require('./lib/util/preconditions');

// errors thrown by the library
poliscore.errors = require('./lib/errors');

// main polis library
poliscore.Address = require('./lib/address');
poliscore.Block = require('./lib/block');
poliscore.MerkleBlock = require('./lib/block/merkleblock');
poliscore.BlockHeader = require('./lib/block/blockheader');
poliscore.HDPrivateKey = require('./lib/hdprivatekey.js');
poliscore.HDPublicKey = require('./lib/hdpublickey.js');
poliscore.Networks = require('./lib/networks');
poliscore.Opcode = require('./lib/opcode');
poliscore.PrivateKey = require('./lib/privatekey');
poliscore.PublicKey = require('./lib/publickey');
poliscore.Script = require('./lib/script');
poliscore.Transaction = require('./lib/transaction');
poliscore.URI = require('./lib/uri');
poliscore.Unit = require('./lib/unit');

// dependencies, subject to change
poliscore.deps = {};
poliscore.deps.bnjs = require('bn.js');
poliscore.deps.bs58 = require('bs58');
poliscore.deps.Buffer = Buffer;
poliscore.deps.elliptic = require('elliptic');
poliscore.deps._ = require('lodash');

// Internal usage, exposed for testing/advanced tweaking
poliscore.Transaction.sighash = require('./lib/transaction/sighash');
