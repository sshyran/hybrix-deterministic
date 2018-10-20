#!/bin/sh
OLDPATH=$PATH
WHEREAMI=`pwd`

# $HYBRIDD/deterministic/modules/ark  => $HYBRIDD
SCRIPTDIR="`dirname \"$0\"`"
HYBRIDD="`cd \"$SCRIPTDIR/../../..\" && pwd`"
DETERMINISTIC="$HYBRIDD/deterministic"
MODULE="$DETERMINISTIC/modules/ark"

# Remove a bug from ark-js library
sed -i -e 's/ typeforce(types.tuple(types.BigInt, types.BigInt), arguments)/\/\/ REMOVED BY IOC:typeforce(types.tuple(types.BigInt, types.BigInt), arguments)/g' "$MODULE/ark-js-mod/lib/ecsignature.js"

cd "$WHEREAMI"
