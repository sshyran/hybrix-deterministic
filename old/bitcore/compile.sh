#!/bin/sh

# set path for developers that don't have node global installation
OLDPATH=$PATH
WHEREAMI=`pwd`
export PATH=$WHEREAMI/../../../node/bin:"$PATH"
NODEINST=`which node`

# create a wrapperlib object for libraries that want to use globals
../../../node_modules/browserify/bin/cmd.js -r ./wrapperlib.js -s wrapperlib > wrapperlib.browserify.js

# pack the deterministic functions
../../../node_modules/browserify/bin/cmd.js deterministic.js -o deterministic.browserify.js

# concatenate these products and compress into DOM injectable
cat wrapperlib.browserify.js deterministic.browserify.js > compiled.js
../../../tools/lzmapack.js compiled.js

# clean up
rm deterministic.browserify.js
rm wrapperlib.browserify.js
rm compiled.js
mv compiled.js.lzma deterministic.js.lzma

# restore path
PATH=$OLDPATH
