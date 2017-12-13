#!/bin/sh
OLDPATH=$PATH
WHEREAMI=`pwd`
export PATH=$WHEREAMI/../../../node/bin:"$PATH"
NODEINST=`which node`

../../../node_modules/browserify/bin/cmd.js deterministic.js -o deterministic.browserify.js

../../../tools/lzmapack.js deterministic.browserify.js
rm deterministic.browserify.js
mv deterministic.browserify.js.lzma deterministic.js.lzma

PATH=$OLDPATH
