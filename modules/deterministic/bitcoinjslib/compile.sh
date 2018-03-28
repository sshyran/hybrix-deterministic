#!/bin/sh
OLDPATH=$PATH
WHEREAMI=`pwd`
export PATH=$WHEREAMI/../../../node/bin:"$PATH"
NODEINST=`which node`

../../../node_modules/browserify/bin/cmd.js wrapperlib.js -o wrapperlib.browserify.js --im  -s wrapperlib

../../../node_modules/browserify/bin/cmd.js deterministic.js -o deterministic.browserify.js

cat counterparty.lib.js wrapperlib.browserify.js deterministic.browserify.js > compiled.js

../../../tools/lzmapack.js compiled.js
rm deterministic.browserify.js
rm wrapperlib.browserify.js
rm compiled.js
mv compiled.js.lzma deterministic.js.lzma

PATH=$OLDPATH
