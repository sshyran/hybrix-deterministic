#!/bin/sh
WHEREAMI="`pwd`";
OLDPATH="$PATH"


echo " [!] Build module-deterministics."

# $HYBRIDD/deterministic/scripts/npm  => $HYBRIDD
SCRIPTDIR="`dirname \"$0\"`"
HYBRIDD="`cd \"$SCRIPTDIR/../../..\" && pwd`"

NODE="$HYBRIDD/node"
DETERMINISTIC="$HYBRIDD/deterministic"
NODEJS="$HYBRIDD/nodejs-v8-lts"
COMMON="$HYBRIDD/common"
WEB_WALLET="$HYBRIDD/web-wallet"

export PATH="$DETERMINISTIC/node_binaries/bin:$PATH"

echo "[.] Copy deterministic distributables to node."

rsync -aK "$DETERMINISTIC/dist/" "$NODE/modules/deterministic/"

export PATH="$OLDPATH"
cd "$WHEREAMI"
