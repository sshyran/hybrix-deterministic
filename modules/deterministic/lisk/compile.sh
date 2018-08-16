#!/bin/sh
OLDPATH=$PATH
WHEREAMI=`pwd`
export PATH=$WHEREAMI/../../../node/bin:"$PATH"
NODEINST=`which node`

../../../node_modules/webpack/bin/webpack.js --config webpack.config.js

# define undefined globals explicitly
sh ../../../pack/define.sh bundle.js > bundle.noundefs.js
# replace global naclInstance with window.naclInstance
sed -i -e 's|\ naclInstance|window.naclInstance|g' ./lisk-js/lib/transactions/crypto.js

# lmza compression
../../../tools/lzmapack.js bundle.noundefs.js
mv bundle.noundefs.js.lzma deterministic.js.lzma

# clean up
rm bundle.js
#rm bundle.noundefs.js

PATH=$OLDPATH
