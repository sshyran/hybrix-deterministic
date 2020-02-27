#!/bin/sh
WHEREAMI="`pwd`";
OLDPATH="$PATH"

# $HYBRIXD/deterministic/scripts/npm  => $HYBRIXD
SCRIPTDIR="`dirname \"$0\"`"
HYBRIXD="`cd \"$SCRIPTDIR/../../..\" && pwd`"

NODE="$HYBRIXD/node"
DETERMINISTIC="$HYBRIXD/deterministic"
NODEJS="$HYBRIXD/nodejs"
COMMON="$HYBRIXD/common"
INTERFACE="$HYBRIXD/interface"

if [ -e "$HYBRIXD/hybrixd" ] || [ "$1" = "public" ] ; then
    ENVIRONMENT="public"
    echo "[i] Environment is public..."
elif [ -e "$HYBRIXD/node" ] || [ "$1" = "dev" ] ; then
    ENVIRONMENT="dev"
    echo "[i] Environment is development..."
else
    echo "[i] Could not determine environment"
    read -p " [?] Please enter environment [dev/public] " ENVIRONMENT
fi

if [ "$ENVIRONMENT" = "dev" ]; then
    URL_COMMON="https://gitlab.com/hybrix/hybrixd/common.git"
    URL_INTERFACE="https://www.gitlab.com/hybrix/hybrixd/interface.git"
    URL_NODEJS="https://www.gitlab.com/hybrix/hybrixd/dependencies/nodejs.git"
    URL_NODE="https://www.gitlab.com/hybrix/hybrixd/node.git"
    echo "[i] Environment is development..."
elif [ "$ENVIRONMENT" = "public" ]; then
    URL_COMMON="https://github.com/hybrix-io/common.git"
    URL_INTERFACE="https://github.com/hybrix-io/hybrix-jslib.git"
    URL_NODEJS="https://github.com/hybrix-io/nodejs.git"
    URL_NODE="https://github.com/hybrix-io/hybrixd.git"
    echo "[i] Environment is public..."
else
    echo "[!] Unknown Environment (please use npm run setup[:dev])"
    export PATH="$OLDPATH"
    cd "$WHEREAMI"
    exit 1
fi


if [ "`uname`" = "Darwin" ]; then
    SYSTEM="darwin-x64"
elif [ "`uname -m`" = "i386" ] || [ "`uname -m`" = "i686" ] || [ "`uname -m`" = "x86_64" ]; then
    SYSTEM="linux-x64"
else
    echo "[!] Unknown Architecture (or incomplete implementation)"
    export PATH="$OLDPATH"
    cd "$WHEREAMI"
    exit 1;
fi


# NODE_BINARIES
if [ ! -e "$DETERMINISTIC/node_binaries" ];then

    echo "[!] deterministic/node_binaries not found."

    if [ ! -e "$NODEJS" ];then
        cd "$HYBRIXD"
        echo "[i] Clone node js runtimes files"
        git clone "$URL_NODEJS"
        if [ "$ENVIRONMENT" = "public" ]; then
            echo "[i] Link hybrixd-dependencies-nodejs files"
            ln -sf "hybrixd-dependencies-nodejs" "nodejs"
        fi
    fi
    echo "[i] Link node_binaries files"
    ln -sf "$NODEJS/$SYSTEM" "$DETERMINISTIC/node_binaries"
fi
export PATH="$DETERMINISTIC/node_binaries/bin:$PATH"


# COMMON
if [ ! -e "$DETERMINISTIC/common" ];then

    echo "[!] deterministic/common not found."

    if [ ! -e "$COMMON" ];then
        cd "$HYBRIXD"
        echo "[i] Clone common files"
        git clone "$URL_COMMON"
        if [ "$ENVIRONMENT" = "public" ]; then
            echo "[i] Link hybrixd-common files"
            ln -sf "hybrixd-common" "common"
        fi
    fi

    echo "[i] Link common files"
    ln -sf "$COMMON" "$DETERMINISTIC/common"

fi

# INTERFACE
if [ ! -e "$DETERMINISTIC/interface" ];then
    echo "[!] deterministic/interface not found."
    if [ ! -e "$INTERFACE" ];then
        cd "$HYBRIXD"
        echo "[i] Clone interface files"
        git clone "$URL_INTERFACE"

        ln -sf "hybrixd-interface" "interface"
        echo "[i] Run node setup"
        sh "$INTERFACE/scripts/npm/setup.sh"
    fi

    echo "[i] Link interface files"
    ln -sf "$INTERFACE/dist" "$DETERMINISTIC/interface"
fi

# NODE
if [ ! -e "$HYBRIXD/node" ];then
    echo "[!] node not found."
    cd "$HYBRIXD"
    echo "[i] Clone node files"
    git clone "$URL_NODE"
    ln -sf "hybrixd" "node"

    echo "[i] Run node setup"
    sh "$NODE/scripts/npm/setup.sh"
fi


# GIT HOOKS
sh "$COMMON/hooks/hooks.sh" "$DETERMINISTIC"

export PATH="$OLDPATH"
cd "$WHEREAMI"
