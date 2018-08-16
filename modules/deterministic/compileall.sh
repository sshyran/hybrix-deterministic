#!/bin/sh

HYBRIDD=$1

echo "[.] Compiling all deterministic routines..."
HERE="`pwd`";
cd "`cd $( dirname $BASH_SOURCE[0] ) && pwd`"

for D in *; do
    if [ -d "${D}" ]; then
      echo "[.] Checking ${D}..."
	    cd ${D}


      if uname | grep -q "Darwin"; then
        NEWEST_FILE="$(find . -type f -print0 | xargs -0 stat -f '%m %N' | sort -rn | head -1 | cut -f2- -d' ')";
      else
        NEWEST_FILE="$(find . -type f -print0 | xargs -0 stat -c '%m %Y' | sort -rn | head -1 | cut -f2- -d' ')";
      fi

      #Check if compilation is required
      if [ "$NEWEST_FILE" -nt "deterministic.js.lzma" ]; then
          echo "[.] Needs compiling"
          ./compile.sh
          echo "[.] Compiling completed"
      else
          echo "[.] Skip compiling"
      fi
      #Check if migrating is requested
      if [ -z "$HYBRIDD" ]; then
        echo "[.] No migration requested"
      else
          #Check if migrating is required
          if [ "$HYBRIDD/modules/deterministic/$D/deterministic.js.lzma" -ot "deterministic.js.lzma" ]; then
          echo "[.] Needs migrating [$HYBRIDD]"
          mkdir -p $HYBRIDD/modules/deterministic/$D
          cp deterministic.js.lzma $HYBRIDD/modules/deterministic/$D/deterministic.js.lzma
          echo "[.] Migrating completed"
        else
          echo "[.] Skip migrating"
        fi
      fi
	    cd ..
    fi
done
cd "${HERE}"
echo "[.] All done."
