#!/bin/sh
HERE="`pwd`";


echo " [!] Build module-deterministics."

# $HYBRIDD/$NODE/scripts/npm  => $HYBRIDD
SCRIPTDIR="`dirname \"$0\"`"
HYBRIDD="`cd \"$SCRIPTDIR/../../..\" && pwd`"

NODE="$HYBRIDD/node"
DETERMINISTIC="$HYBRIDD/deterministic"
NODEJS="$HYBRIDD/nodejs-v8-lts"
COMMON="$HYBRIDD/common"
WEB_WALLET="$HYBRIDD/web-wallet"

OLDPATH="$PATH"
export PATH=$DETERMINISTIC/node/bin:"$PATH"

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
if [ ! -e "$DETERMINISTIC/node" ];then

    echo " [!] deterministic/node not found."

    if [ ! -e "$NODEJS" ];then
        cd "$HYBRIDD"
        echo " [i] Clone node js runtimes files"
        git clone https://github.com/internetofcoins/nodejs-v8-lts.git
    fi
    echo " [i] Link NODEJS files"
    ln -sf "$NODEJS/$SYSTEM" "$DETERMINISTIC/node"
fi

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

cd "$DETERMINISTIC/modules"

for D in *; do
    if [ -d "${D}" ]; then
        echo "[.] Checking ${D}..."
        cd ${D}


        if [ "$SYSTEM" = "darwin-x64" ]; then
            NEWEST_FILE="$(find . -type f -print0 | xargs -0 stat -f '%m %N' | sort -rn | head -1 | cut -f2- -d' ')";
        else
            NEWEST_FILE="$(find . -printf '%p\n' | sort -r | head -n1)";
        fi

        #Check if compilation is required
        if [ ! -e "deterministic.js.lzma" ] || [ "$NEWEST_FILE" -nt "deterministic.js.lzma" ]; then
            echo "[.] Needs compiling"
            ./compile.sh
            echo "[.] Compiling completed"
        else
            echo "[.] Skip compiling"
        fi
        echo "[.] Migrating"
        mkdir -p "$NODE/modules/deterministic/$D"
        cp deterministic.js.lzma "$NODE/modules/deterministic/$D/deterministic.js.lzma"

        cd ..
    fi
done
cd "${HERE}"
echo "[.] deterministics: All done."
export PATH="$OLDPATH"
