const path = require('path');

module.exports = {
  mode: 'development',
  entry: './dist/index.js',
  output: {
    path: path.resolve(__dirname, 'bundle'),
    filename: 'app-updata.js',
    library: 'AppUpdata'
  },
  devtool: 'inline-source-map'
}
