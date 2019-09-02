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
WEB_WALLET="$HYBRIXD/web-wallet"
ENVIRONMENT=$1

if [ "$ENVIRONMENT" == "dev" ]; then
    URL_COMMON="https://gitlab.com/hybrix/hybrixd/common.git"
    URL_INTERFACE="https://www.gitlab.com/hybrix/hybrixd/interface.git"
    echo "[i] Environment is development..."
elif [ "$ENVIRONMENT" == "public" ]; then
    URL_COMMON="https://github.com/hybrix-io/hybrixd-common.git"
    URL_INTERFACE="https://github.com/hybrix-io/hybrixd-interface.git"
    echo "[i] Environment is public..."
else
    echo "[!] Unknown Environment (please use npm run setup[:dev])"
    exit 1
fi


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
        cd "$HYBRIXD"
        echo " [i] Clone node js runtimes files"
        git clone https://www.gitlab.com/hybrix/hybrixd/dependencies/nodejs.git #TODO find this on github for public consumption!
    fi
    echo " [i] Link node_binaries files"
    ln -sf "$NODEJS/$SYSTEM" "$DETERMINISTIC/node_binaries"
fi
export PATH="$DETERMINISTIC/node_binaries/bin:$PATH"


# COMMON
if [ ! -e "$DETERMINISTIC/common" ];then

    echo " [!] deterministic/common not found."

    if [ ! -e "$COMMON" ];then
        cd "$HYBRIXD"
        echo " [i] Clone common files"
        git clone $URL_COMMON
    fi
    echo " [i] Link common files"
    ln -sf "$COMMON" "$DETERMINISTIC/common"

fi

# INTERFACE
if [ ! -e "$DETERMINISTIC/interface" ];then

    echo " [!] deterministic/interface not found."

    if [ ! -e "$INTERFACE" ];then
        cd "$HYBRIXD"
        echo " [i] Clone interface files"
        git clone $URL_INTERFACE
    fi
    echo " [i] Link interface files"
    ln -sf "$INTERFACE/dist" "$DETERMINISTIC/interface"
fi

# GIT HOOKS
sh "$COMMON/hooks/hooks.sh" "$DETERMINISTIC"

export PATH="$OLDPATH"
cd "$WHEREAMI"
