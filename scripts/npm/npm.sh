#!/bin/sh
OLDPATH=$PATH
WHEREAMI=`pwd`

# $HYBRIDD/deterministic/scripts/npm  => $HYBRIDD
SCRIPTDIR="`dirname \"$0\"`"
HYBRIDD="`cd \"$SCRIPTDIR/../../..\" && pwd`"
DETERMINISTIC="$HYBRIDD/deterministic"
export PATH="$DETERMINISTIC/node_binaries/bin:$PATH"
NPMINST=`which npm`

node "$DETERMINISTIC/node_binaries/bin/npm" $@

export PATH="$OLDPATH"
cd "$WHEREAMI"
