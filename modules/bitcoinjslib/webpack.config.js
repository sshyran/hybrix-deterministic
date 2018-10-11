const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  entry: './deterministic.js',
  output: {
    path: path.resolve(__dirname, '.'),
    filename: 'bundle.js'
    ,library: 'test' // added to create a library file
  },
  optimization: {
    minimize: true,
    minimizer: [new UglifyJsPlugin({
        include: /\.min\.js$/,
        uglifyOptions: {
            mangle: {
                reserved: [
                    'Buffer',
                    'BigInteger',
                    'Point',
                    'ECPubKey',
                    'ECKey',
                    'sha512_asm',
                    'asm',
                    'ECPair',
                    'HDNode'
                ]
            }
        }
    })]
  }
};

