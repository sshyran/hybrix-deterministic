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


if [ "`uname`" = "Darwin" ]; then
    SYSTEM="darwin-x64"
elif [ "`uname -m`" = "i386" ] || [ "`uname -m`" = "i686" ]; then
    SYSTEM="x86"
elif [ "`uname -m`" = "x86_64" ]; then
    SYSTEM="x86_64"
else
    echo "[!] Unknown Architecture (or incomplete implementation)"
    exit 1;
fi

# NODE
if [ ! -e "$DETERMINISTIC/node_binaries" ];then

    echo " [!] deterministic/node_binaries not found."

    if [ ! -e "$NODEJS" ];then
        cd "$HYBRIDD"
        echo " [i] Clone node js runtimes files"
        git clone https://github.com/internetofcoins/nodejs-v8-lts.git
    fi
    echo " [i] Link NODEJS files"
    ln -sf "$NODEJS/$SYSTEM" "$DETERMINISTIC/node_binaries"
fi
export PATH="$DETERMINISTIC/node_binaries/bin:$PATH"


# COMMON
if [ ! -e "$DETERMINISTIC/common" ];then

    echo " [!] deterministic/common not found."

    if [ ! -e "$COMMON" ];then
        cd "$HYBRIDD"
        echo " [i] Clone common files"
        git clone https://www.gitlab.com/iochq/hybridd/common.git
    fi
    echo " [i] Link common files"
    ln -sf "$COMMON" "$DETERMINISTIC/common"

fi


export PATH="$OLDPATH"
cd "$WHEREAMI"
