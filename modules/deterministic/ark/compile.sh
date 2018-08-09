#!/bin/sh
OLDPATH=$PATH
WHEREAMI=`pwd`
export PATH=$WHEREAMI/../../../node/bin:"$PATH"
NODEINST=`which node`

# Remove a bug from ark-js library
sed -i -e 's/ typeforce(types.tuple(types.BigInt, types.BigInt), arguments)/\/\/ REMOVED BY IOC:typeforce(types.tuple(types.BigInt, types.BigInt), arguments)/g' ./ark-js-mod/lib/ecsignature.js


../../../node_modules/webpack/bin/webpack.js --config webpack.config.js

# define undefined globals explicitly
sh ../../../pack/define.sh bundle.js > bundle.noundefs.js

# lmza compression
../../../tools/lzmapack.js bundle.noundefs.js
mv bundle.noundefs.js.lzma deterministic.js.lzma

# clean up
rm bundle.js
rm bundle.noundefs.js

PATH=$OLDPATH
