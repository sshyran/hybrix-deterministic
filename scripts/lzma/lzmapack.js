#!/usr/bin/env node
var cmdlinearg = process.argv[2];
var fs = require('fs');
LZString = require('../../common/crypto/lz-string.js');
UrlBase64 = require('../../common/crypto/urlbase64.js');

var jsdata = fs.readFileSync(cmdlinearg, 'utf8');

var lzma_result = LZString.compressToEncodedURIComponent(jsdata);

fs.writeFileSync(cmdlinearg+'.lzma',lzma_result);
