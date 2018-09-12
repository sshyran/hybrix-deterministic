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
sed -i -e 's|window.fetch.bind(window)|window.altFetch|g' ./wrapperlib.js

../../node_modules/webpack/bin/webpack.js --config webpack.config.js

# define undefined globals expliocitly
sh ../../scripts/deglobalify/deglobalify.sh bundle.js > bundle.noundefs.js

# Some obscure javascript that is doomed to throw errors, resulting in unhandled promises. So we overwrite it.
# var t="string"==typeof e.data.body?e.data.body:JSON.stringify(e.data.body);r(t)
sed -i -e 's|var t="string"==typeof e\.data\.body?e\.data\.body:JSON\.stringify(e\.data\.body);r(t)|r(true)|g' ./bundle.noundefs.js

# lmza compression
../../scripts/lzma/lzmapack.js bundle.noundefs.js
mv bundle.noundefs.js.lzma deterministic.js.lzma

# clean up
rm bundle.js
rm bundle.noundefs.js

PATH=$OLDPATH
