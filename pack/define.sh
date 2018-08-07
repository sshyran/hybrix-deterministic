
#echo "Finding undefined variables."
WHEREAMI=`pwd`

eslint -f compact -c ../../../pack/.eslintrc.json "$1" > "$1.eslint.txt"
grep -n "no-undef" "$1.eslint.txt" > "$1.no-undef1.txt"
sed -n 's/^.*'\''\([^'\'']*\)'\''.*$/\1/p' "$1.no-undef1.txt" > "$1.no-undef2.txt"
awk '!a[$0]++' "$1.no-undef2.txt" > "$1.no-undef3.txt"

#echo "Declare undefined variables in global scope."
node ../../../pack/addUndefinedVarsAsGlobalVars.js "$1" "$1.no-undef3.txt"

rm "$1.eslint.txt"
rm "$1.no-undef1.txt"
rm "$1.no-undef2.txt"
rm "$1.no-undef3.txt"

#echo "All done!"



