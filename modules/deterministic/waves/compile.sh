#!/bin/sh

# set path for developers that don't have node global installation
OLDPATH=$PATH
WHEREAMI=`pwd`
export PATH=$WHEREAMI/../../../node/bin:"$PATH"
NODEINST=`which node`

# copy the vanilla waves minified to wrapperlib
cp ./waves-api.min.js ./wrapperlib.js
# string replace to standardize naming of the module to wrapperlib
sed -i -e 's/WavesAPI/wrapperlib/g' ./wrapperlib.js
# replace the default fetch with an alternative fetch
sed -i -e 's|window.fetch.bind(window)|altFetch.bind(window)|g' ./wrapperlib.js

# TODO inject??

../../../node_modules/webpack/bin/webpack.js --config webpack.config.js
../../../tools/lzmapack.js bundle.js
mv bundle.js.lzma deterministic.js.lzma

# clean up
rm bundle.js
rm wrapperlib.js

# restore path
PATH=$OLDPATH
