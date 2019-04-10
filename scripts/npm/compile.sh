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
            if [ -e "precompile.sh" ]; then
                sh precompile.sh
            fi
            if [ -e "compile.sh" ]; then
                sh compile.sh
            else
                sh "$DETERMINISTIC/scripts/default/compile.default.sh" "$D"
            fi
            if [ $? -eq 0 ]; then
                echo "[.] Compiling completed"
            else
                echo "[.] Compiling failed"
               exit 1;
            fi

            echo "[.] Move to dist"
            mv "deterministic.js.lzma" "$DETERMINISTIC/dist/$D/deterministic.js.lzma"
        else
            echo "[.] Skip compiling"
        fi
        cd ..
    fi
done

rsync -aK "$DETERMINISTIC/lib/" "$DETERMINISTIC/dist/"


export PATH="$OLDPATH"
cd "$WHEREAMI"
