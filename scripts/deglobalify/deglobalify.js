/*
  Define all undefined vars
*/

const fs = require('fs')
const Window = require('window');
const window = new Window();

var source = process.argv[2];
var noUndef3 = process.argv[3]

fs.readFile(noUndef3, "utf8", function (err, unDefVars) {
  if(err) throw err;
  var array = unDefVars.toString().split("\n");

  fs.readFile(source, "utf8", function (err, bundle) {
    var vars = array
        .filter(function (var_) {return var_ !== ''
                                 && var_ !== 'proto' // For tron
                                 && var_ !== 'DataView' // For eth
                                 && var_ !== 'nacl' && var_ !== 'naclInstance'  // For lsk
                                })
      .reduce(function (acc, variable) {
        return window.hasOwnProperty(variable)
          ? acc + ''
          : acc + variable + ',';
      }, 'var ');
    if(vars === 'var '){ //OMG no global variables, nothing to do
      process.stdout.write(bundle);
    }else{
      var finalCodeWithVars = vars.replace(/.$/,";\ ") +'      '+ bundle;
      process.stdout.write(finalCodeWithVars);
    }
  })
});
