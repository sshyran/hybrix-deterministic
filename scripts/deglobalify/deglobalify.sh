#!/bin/sh
WHEREAMI=`pwd`
OLDPATH="$PATH"

SCRIPTDIR="`dirname \"$0\"`"
DEGLOBALIFY="`cd \"$SCRIPTDIR\" && pwd`"
# use eslint from common repository
ESLINT="$DEGLOBALIFY/../../common/node_modules/.bin/eslint"

export PATH="$DEGLOBALIFY/../../node_binaries/bin:$PATH"


${ESLINT} -f compact -c "$DEGLOBALIFY/.eslintrc.json" "$1" > "$1.eslint.txt"
grep -n "no-undef" "$1.eslint.txt" > "$1.no-undef1.txt"
sed -n 's/^.*'\''\([^'\'']*\)'\''.*$/\1/p' "$1.no-undef1.txt" > "$1.no-undef2.txt"
awk '!a[$0]++' "$1.no-undef2.txt" > "$1.no-undef3.txt"

#echo "Declare undefined variables in global scope."
node "$DEGLOBALIFY/deglobalify.js" "$1" "$1.no-undef3.txt"

rm "$1.eslint.txt"
rm "$1.no-undef1.txt"
rm "$1.no-undef2.txt"
rm "$1.no-undef3.txt"

export PATH="$OLDPATH"
cd "$WHEREAMI"
