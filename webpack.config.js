const path = require('path');
const webpack = require('webpack');
const Dotenv = require('dotenv-webpack');

module.exports = {
  entry: './main.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  plugins: [
    new Dotenv(),
    new webpack.DefinePlugin({
      'process.env.GIPHY_API_KEY': JSON.stringify(process.env.GIPHY_API_KEY)
    })
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, '/')
    },
    compress: true,
    port: 3000
  }
};
