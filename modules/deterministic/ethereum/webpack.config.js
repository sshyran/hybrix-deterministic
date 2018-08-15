const path = require('path');

module.exports = {
  entry: './deterministic.js',
  output: {
    path: path.resolve(__dirname, '.'),
    filename: 'bundle.js'
    ,library: 'test' // added to create a library file
  },
  // module: {
  //   rules: [
  //     {
  //       exclude: path.resolve(__dirname, "../../../node_modules"),
  //       test: /\.js$/,
  //       use: {
  //         loader: 'babel-loader',
  //         options: {
  //           presets: ['es2015']
  //         }
  //       }
  //     }
  //   ]
  // }
};
