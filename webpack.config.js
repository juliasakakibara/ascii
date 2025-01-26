const path = require('path');
const webpack = require('webpack');
const Dotenv = require('dotenv-webpack');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

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
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader']
      }
    ]
  },
  plugins: [
    new Dotenv(),
    new webpack.DefinePlugin({
      'process.env.GIPHY_API_KEY': JSON.stringify(process.env.GIPHY_API_KEY)
    }),
    new HtmlWebpackPlugin({
      template: './index.html',
      filename: 'index.html'
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css'
    }),
    new CopyPlugin({
      patterns: [
        { from: 'favicon.svg' },
        { from: 'gif.worker.js' },
        { from: 'preview.png' }
      ]
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
