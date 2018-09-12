#!/bin/sh
OLDPATH=$PATH
WHEREAMI=`pwd`
export PATH=$WHEREAMI/../../../node/bin:"$PATH"
NODEINST=`which node`

../../node_modules/webpack/bin/webpack.js --config webpack.config.js

# define undefined globals explicitly
sh ../../scripts/deglobalify/deglobalify.sh bundle.js > bundle.noundefs.js
# replace global naclInstance with injected window.nacl
sed -i -e 's|naclInstance|window.nacl|g' ./lisk-js/lib/transactions/crypto.js

# lmza compression
../../scripts/lzma/lzmapack.js bundle.noundefs.js
mv bundle.noundefs.js.lzma deterministic.js.lzma

# clean up
rm bundle.js
rm bundle.noundefs.js

PATH=$OLDPATH
