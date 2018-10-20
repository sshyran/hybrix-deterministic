#!/bin/sh
OLDPATH=$PATH
WHEREAMI=`pwd`

# $HYBRIDD/deterministic/scripts/npm  => $HYBRIDD
SCRIPTDIR="`dirname \"$0\"`"
HYBRIDD="`cd \"$SCRIPTDIR/../../..\" && pwd`"
DETERMINISTIC="$HYBRIDD/deterministic"
export PATH="$DETERMINISTIC/node_binaries/bin:$PATH"

MODULE="$DETERMINISTIC/modules/$1"
DEFAULT="$DETERMINISTIC/scripts/default"


if [ -e "$MODULE/webpack.config.js" ]; then
    BUNDLE="$MODULE"
    "$DETERMINISTIC/node_modules/webpack/bin/webpack.js" --config "$BUNDLE/webpack.config.js"
else
    BUNDLE="$DEFAULT"
    "$DETERMINISTIC/node_modules/webpack/bin/webpack.js" --config "$BUNDLE/webpack.config.js"
fi

# define undefined globals explicitly
sh $DETERMINISTIC/scripts/deglobalify/deglobalify.sh "$BUNDLE/bundle.js" > "$BUNDLE/bundle.noundefs.js"

# lmza compression
$DETERMINISTIC/scripts/lzma/lzmapack.js "$BUNDLE/bundle.noundefs.js"
mv "$BUNDLE/bundle.noundefs.js.lzma" "$MODULE/deterministic.js.lzma"

# clean up
rm "$BUNDLE/bundle.js"
rm "$BUNDLE/bundle.noundefs.js"

export PATH="$OLDPATH"
cd "$WHEREAMI"
