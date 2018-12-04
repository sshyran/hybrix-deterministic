#!/bin/sh
OLDPATH=$PATH
WHEREAMI=`pwd`

# $HYBRIXD/deterministic/modules/ark  => $HYBRIXD
SCRIPTDIR="`dirname \"$0\"`"
HYBRIXD="`cd \"$SCRIPTDIR/../../..\" && pwd`"
DETERMINISTIC="$HYBRIXD/deterministic"
MODULE="$DETERMINISTIC/modules/ark"

# Remove a bug from ark-js library
sed -i -e 's/ typeforce(types.tuple(types.BigInt, types.BigInt), arguments)/\/\/ REMOVED BY IOC:typeforce(types.tuple(types.BigInt, types.BigInt), arguments)/g' "$MODULE/ark-js-mod/lib/ecsignature.js"

cd "$WHEREAMI"
