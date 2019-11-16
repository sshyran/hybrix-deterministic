#!/bin/sh
OLDPATH=$PATH
WHEREAMI=$(pwd)

export PATH=$WHEREAMI/node_binaries/bin:"$PATH"

echo "[i] node version $(node --version)"

echo "[.] remove transports module"

rm -rf "./modules/transport"

# for testing purposes replace empty string with /root in config
sed -i -e "s#\"\"#\"/root\"#g" hybrixd.conf

echo "[.] Starting hybrixd"
./hybrixd > /dev/null &

sleep 1m

echo "[.] Enable hybrixd api queue forced test mode"
./hybrixd /c/apiqueue/test/force

# verbose output of percentages
sh ./scripts/npm/test.sh v
FAILED=$?

echo "[.] Stopping hybrixd"
./hybrixd /c/stop

if [ "$FAILED" -eq 0  ]; then
    echo "[v] Test succeeded."
else
    echo "[!] Test failed!"
    cat "var/log/hybrixd.log"
    exit 1;
fi

export PATH="$OLDPATH"
cd "$WHEREAMI"

exit 0
