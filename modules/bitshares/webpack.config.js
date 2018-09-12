const path = require('path');

module.exports = {
  entry: './deterministic.js',
  externals: {
    fs: 'null',
    tls: 'null'
  },
  output: {
    path: path.resolve(__dirname, '.'),
    filename: 'bundle.js'
    ,library: 'test' // added to create a library file
  }
};
