#!/bin/sh

# set path for developers that don't have node global installation
OLDPATH=$PATH
WHEREAMI=`pwd`
export PATH=$WHEREAMI/../../../node/bin:"$PATH"
NODEINST=`which node`

# copy the vanilla waves minified to wrapperlib
#cp ./waves-api.min.js ./wrapperlib.js
cp ./waves-api.js ./wrapperlib.js

# inject
cat ./injections.js ./wrapperlib.js > ./wrapperlib.tmp.js; mv ./wrapperlib.tmp.js ./wrapperlib.js


# string replace to standardize naming of the module to wrapperlib
sed -i -e 's/WavesAPI/wrapperlib/g' ./wrapperlib.js
# replace the default fetch with an alternative fetch
#sed -i -e 's|window.fetch.bind(window)|altFetch.bind(window)|g' ./wrapperlib.js


#../../../node_modules/browserify/bin/cmd.js -r ./wrapperlib.js -s wrapperlib > wrapperlib.browserify.js

# pack the deterministic functions
../../../node_modules/browserify/bin/cmd.js wrapperlib.js -o wrapperlib.browserify.js
../../../node_modules/browserify/bin/cmd.js deterministic.js -o deterministic.browserify.js

# concatenate these products and compress into DOM injectable
cat wrapperlib.browserify.js deterministic.browserify.js > compiled.js
../../../tools/lzmapack.js compiled.js

# clean up
rm wrapperlib.browserify.js
rm deterministic.browserify.js
rm compiled.js
mv compiled.js.lzma deterministic.js.lzma

# restore path
PATH=$OLDPATH
