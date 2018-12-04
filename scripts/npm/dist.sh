#!/bin/sh
WHEREAMI="`pwd`";
OLDPATH="$PATH"

# $HYBRIXD/deterministic/scripts/npm  => $HYBRIXD
SCRIPTDIR="`dirname \"$0\"`"
HYBRIXD="`cd \"$SCRIPTDIR/../../..\" && pwd`"

NODE="$HYBRIXD/node"
DETERMINISTIC="$HYBRIXD/deterministic"
NODEJS="$HYBRIXD/nodejs-v8-lts"
COMMON="$HYBRIXD/common"
WEB_WALLET="$HYBRIXD/web-wallet"

export PATH="$DETERMINISTIC/node_binaries/bin:$PATH"

echo "[.] Copy deterministic distributables to node."

rsync -aK "$DETERMINISTIC/dist/" "$NODE/modules/deterministic/"

export PATH="$OLDPATH"
cd "$WHEREAMI"
