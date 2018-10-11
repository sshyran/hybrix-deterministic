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

export PATH="$DETERMINISTIC/node_binaries/bin:$PATH"


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

        mkdir -p "$DETERMINISTIC/dist/$D"
        #Check if compilation is required
        if [ ! -e "$DETERMINISTIC/dist/$D/deterministic.js.lzma" ] || [ "$NEWEST_FILE" -nt "$DETERMINISTIC/dist/$D/deterministic.js.lzma" ]; then
            echo "[.] Needs compiling"
            ./compile.sh
            echo "[.] Compiling completed"
            echo "[.] Move to dist"
            mv "deterministic.js.lzma" "$DETERMINISTIC/dist/$D/deterministic.js.lzma"
        else
            echo "[.] Skip compiling"
        fi
        cd ..
    fi
done


export PATH="$OLDPATH"
cd "$WHEREAMI"
