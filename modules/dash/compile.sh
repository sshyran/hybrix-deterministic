#!/bin/sh

# set path for developers that don't have node global installation
OLDPATH=$PATH
WHEREAMI=`pwd`
export PATH="$WHEREAMI/../../node_binaries/bin:$PATH"
NODEINST=`which node`

../../node_modules/webpack/bin/webpack.js --config webpack.config.js

# define undefined globals expliocitly
sh ../../scripts/deglobalify/deglobalify.sh bundle.js > bundle.noundefs.js

# lmza compression
../../scripts/lzma/lzmapack.js bundle.noundefs.js
mv bundle.noundefs.js.lzma deterministic.js.lzma

# clean up
rm bundle.js
rm bundle.noundefs.js


export PATH="$OLDPATH"
cd "$WHEREAMI"
