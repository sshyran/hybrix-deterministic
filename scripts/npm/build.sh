#!/bin/sh
HERE="`pwd`";

echo " [!] Build module-deterministics."

# $IOC/$HYBRIDD/scripts/npm  => $IOC
IOC="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )/../../../"
HYBRIDD="$IOC/hybridd"
MODULE_DETERMINISTIC="$IOC/module-deterministic"
NODEJS="$IOC/nodejs-v8-lts"
COMMON="$IOC/ioc-tools"
WEB_WALLET="$IOC/web-wallet"

if [ $(uname) == "Darwin" ]; then
    SYSTEM="darwin-x64"
elif [ $(uname -m) == "i386" ] || [ $(uname -m) == "i686" ]; then
    SYSTEM="x86"
elif [ $(uname -m) == "x86_64" ]; then
    SYSTEM="x86_64"
else
    echo "[!] Unknown Architecture (or incomplete implementation)"
    exit 1;
fi

# NODE
if [ ! -e "$MODULE_DETERMINISTIC/node" ];then

    echo " [!] module-deterministic/node not found."

    if [ ! -e "$NODEJS" ];then
        cd "$IOC"
        echo " [i] Clone node js runtimes files"
        git clone https://github.com/internetofcoins/nodejs-v8-lts.git
    fi
    echo " [i] Link NODEJS files"
    ln -sf "$NODEJS/$SYSTEM" "$MODULE_DETERMINISTIC/node"
fi

# COMMON
if [ ! -e "$MODULE_DETERMINISTIC/common" ];then

    echo " [!] module-deterministic/common not found."

    if [ ! -e "$COMMON" ];then
        cd "$IOC"
        echo " [i] Clone common files"
        git clone https://www.gitlab.com/iochq/ioc-tools.git
    fi
    echo " [i] Link common files"
    ln -sf "$COMMON" "$MODULE_DETERMINISTIC/common"

fi

cd "$MODULE_DETERMINISTIC/modules"

for D in *; do
    if [ -d "${D}" ]; then
        echo "[.] Checking ${D}..."
        cd ${D}


        if [ "$SYSTEM" == "darwin-x64" ]; then
            NEWEST_FILE="$(find . -type f -print0 | xargs -0 stat -f '%m %N' | sort -rn | head -1 | cut -f2- -d' ')";
        else
            NEWEST_FILE="$(find . -printf '%p\n' | sort -r | head -n1)";
        fi

        #Check if compilation is required
        if [ "$NEWEST_FILE" -nt "deterministic.js.lzma" ]; then
            echo "[.] Needs compiling"
            ./compile.sh
            echo "[.] Compiling completed"
        else
            echo "[.] Skip compiling"
        fi
        echo "[.] Migrating"
        mkdir -p "$HYBRIDD/modules/deterministic/$D"
        cp deterministic.js.lzma "$HYBRIDD/modules/deterministic/$D/deterministic.js.lzma"

        cd ..
    fi
done
cd "${HERE}"
echo "[.] module-deterministics: All done."
