#!/bin/sh
OLDPATH=$PATH
WHEREAMI=`pwd`
export PATH=$WHEREAMI/../../../node/bin:"$PATH"
NODEINST=`which node`


#cp ./ark-js ./wrapperlib.js

#../../../node_modules/webpack/bin/webpack.js --config webpack.config.js
#../../../tools/lzmapack.js bundle.js
#mv bundle.js.lzma deterministic.js.lzma

# clean up
#rm bundle.js
#rm wrapperlib.js

# restore path
PATH=$OLDPATH
