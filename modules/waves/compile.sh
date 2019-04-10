#!/bin/sh

# set path for developers that don't have node global installation
OLDPATH=$PATH
WHEREAMI=`pwd`

SCRIPTDIR="`dirname \"$0\"`"
HYBRIXD="`cd \"$SCRIPTDIR/../../..\" && pwd`"
DETERMINISTIC="$HYBRIXD/deterministic"
MODULE="$DETERMINISTIC/modules/waves"
DEFAULT="$DETERMINISTIC/scripts/default"
export PATH="$DETERMINISTIC/node_binaries/bin:$PATH"
NODEINST=`which node`

# copy the vanilla waves minified to wrapperlib
cp "$MODULE/waves-api.min.js" "$MODULE/wrapperlib.js"
# string replace to standardize naming of the module to wrapperlib
sed -i -e 's/WavesAPI/wrapperlib/g' "$MODULE/wrapperlib.js"
# replace the default fetch with an alternative fetch

A="if(typeof window!==\"undefined\"){return window.fetch.bind(window)}else "
B="return window.altFetch;"
sed -i -e "s/$A/$B/g" "$MODULE/wrapperlib.js"

if [ -e "$MODULE/webpack.config.js" ]; then
    BUNDLE="$MODULE"
    "$DETERMINISTIC/node_modules/webpack/bin/webpack.js" --config "$MODULE/webpack.config.js" --bail --mode production
else
    BUNDLE="$DEFAULT"
    "$DETERMINISTIC/node_modules/webpack/bin/webpack.js" --config "$BUNDLE/webpack.config.js" --bail --mode production
fi
# define undefined globals expliocitly
sh "$DETERMINISTIC/scripts/deglobalify/deglobalify.sh" "$BUNDLE/bundle.js" > "$BUNDLE/bundle.noundefs.js"

# Some obscure javascript that is doomed to throw errors, resulting in unhandled promises. So we overwrite it.
# var t="string"==typeof e.data.body?e.data.body:JSON.stringify(e.data.body);r(t)

sed -i -e 's|var t="string"==typeof e\.data\.body?e\.data\.body:JSON\.stringify(e\.data\.body);r(t)|r(true)|g' "$BUNDLE/bundle.noundefs.js"

# lmza compression
$DETERMINISTIC/scripts/lzma/lzmapack.js "$BUNDLE/bundle.noundefs.js"
mv "$BUNDLE/bundle.noundefs.js.lzma" "$MODULE/deterministic.js.lzma"

# clean up
rm "$BUNDLE/bundle.js"
rm "$BUNDLE/bundle.noundefs.js"
rm "$BUNDLE/bundle.noundefs.js-e"
rm "$MODULE/wrapperlib.js"
rm "$MODULE/wrapperlib.js-e"

export PATH="$OLDPATH"
cd "$WHEREAMI"
