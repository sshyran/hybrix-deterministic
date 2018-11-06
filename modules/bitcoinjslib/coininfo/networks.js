// (C) 2018 Internet of Coins / Joachim de Koning
// bitcoinjs networks generator
//
// replace networks.js in bitcoinjslib to automatically add most known
// Bitcoin derivative coins
//

var coininfo = require('../coininfo');

var networknames = [
 'bitcoin','bitcoin_gold',
 'blackcoin',
 'dash','decred','dogecoin',
 'litecoin',
 'monacoin',
 'namecoin',
 'nubits',
 //'peercoin',  no BIP32 support?
 //'reddcoin',  no BIP32 support?
 'qtum',
 'viacoin'
];

var curr
var frmt
var networks = {};

for(var i=0;i<networknames.length;i++) {
  //DEBUG: console.log(networknames[i]);
  curr = coininfo[networknames[i].replace('_',' ')].main;
  frmt = curr.toBitcoinJS();
  networks[networknames[i]] = {
      messagePrefix: '\x19' + frmt.name + ' Signed Message:\n',
      bip32: {
          public: frmt.bip32.public,
          private: frmt.bip32.private
      },
      pubKeyHash: frmt.pubKeyHash,
      scriptHash: frmt.scriptHash,
      wif: frmt.wif
  }
}

module.exports = networks;

/*
module.exports = {
  bitcoin: {
    messagePrefix: '\x18Bitcoin Signed Message:\n',
    bip32: {
      public: 0x0488b21e,
      private: 0x0488ade4
    },
    pubKeyHash: 0x00,
    scriptHash: 0x05,
    wif: 0x80
  },
  testnet: {
    messagePrefix: '\x18Bitcoin Signed Message:\n',
    bip32: {
      public: 0x043587cf,
      private: 0x04358394
    },
    pubKeyHash: 0x6f,
    scriptHash: 0xc4,
    wif: 0xef
  },
  litecoin: {
    messagePrefix: '\x19Litecoin Signed Message:\n',
    bip32: {
      public: 0x019da462,
      private: 0x019d9cfe
    },
    pubKeyHash: 0x30,
    scriptHash: 0x32,
    wif: 0xb0
  }
}
*/
