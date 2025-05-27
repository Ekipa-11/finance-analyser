const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { GenerateSW } = require('workbox-webpack-plugin');
const DotenvWebpackPlugin = require('dotenv-webpack');

if (1 == 2) {
  plugins.push(new GenerateSW({
    clientsClaim: true,
    skipWaiting: true
  }));
}

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.[contenthash].js',
    clean: true
  },
  module: {
    rules: [
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
      {
        test: /manifest\.json$/,
        type: 'asset/resource',
        generator: { filename: '[name][ext]' }
      },
      {
        test: /\.(png|jpe?g|svg|jpg)$/,
        type: 'asset/resource',
        generator: {
          filename: (pathData) => {
            // preserve subfolders under src/, so src/icons/* → dist/icons/*
            const filepath = pathData.filename.replace(/\\/g, '/');
            if (filepath.startsWith('src/icons/')) {
              return 'icons/[name][ext]';
            }
            if (filepath.startsWith('src/screenshots/')) {
              return 'screenshots/[name][ext]';
            }
            return '[name][ext]';
          }
        }
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/html/login.html',
      filename: 'login.html',
      inject: 'body'
    }),
    new HtmlWebpackPlugin({
      template: './src/html/budget.html',
      filename: 'budget.html',
      inject: 'body'
    }),
    new GenerateSW({ clientsClaim: true, skipWaiting: true }),
    new DotenvWebpackPlugin({ systemvars: true })
  ],
  devServer: {
    static: './dist',
    historyApiFallback: {
      index: '/login.html',
      rewrites: [
        { from: /^\/login/, to: '/login.html' },
        { from: /^\/budget/, to: '/budget.html' }
      ]
    },
    proxy: {
      '/api': {
        target: process.env.API_BASE_URL,  
        changeOrigin: true,
        secure: false,
      },
    },
    port: 8080,
    open: true
  }
};
