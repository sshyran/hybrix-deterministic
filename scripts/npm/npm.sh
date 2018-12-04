#!/bin/sh
OLDPATH=$PATH
WHEREAMI=`pwd`

# $HYBRIXD/deterministic/scripts/npm  => $HYBRIXD
SCRIPTDIR="`dirname \"$0\"`"
HYBRIXD="`cd \"$SCRIPTDIR/../../..\" && pwd`"
DETERMINISTIC="$HYBRIXD/deterministic"
export PATH="$DETERMINISTIC/node_binaries/bin:$PATH"
NPMINST=`which npm`

node "$DETERMINISTIC/node_binaries/bin/npm" $@

export PATH="$OLDPATH"
cd "$WHEREAMI"
