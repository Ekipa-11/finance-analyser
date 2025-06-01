const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { GenerateSW } = require('workbox-webpack-plugin');
const DotenvWebpackPlugin = require('dotenv-webpack');
require('dotenv').config();

if (process.env.API_BASE_URL === undefined) {
  console.error('\x1b[31m%s\x1b[0m', 'API_BASE_URL environment variable is not set.\x1b[0m');
  process.exit(1);
}

if (1 == 2) {
  plugins.push(
    new GenerateSW({
      clientsClaim: true,
      skipWaiting: true,
    })
  );
}

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.[contenthash].js',
    clean: true,
  },
  module: {
    rules: [
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
      {
        test: /manifest\.json$/,
        type: 'asset/resource',
        generator: { filename: '[name][ext]' },
      },
      {
        test: /\.(png|jpe?g|svg|jpg|ico)$/,
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
          },
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/html/login.html',
      filename: 'login.html',
      inject: 'body',
    }),
    new HtmlWebpackPlugin({
      template: './src/html/register.html',
      filename: 'register.html',
      inject: 'body',
    }),
    new HtmlWebpackPlugin({
      template: './src/html/budget.html',
      filename: 'budget.html',
      inject: 'body',
    }),
    new HtmlWebpackPlugin({
      template: './src/html/graphs.html',
      filename: 'graphs.html',
      inject: 'body',
    }),
    new GenerateSW({
      clientsClaim: true,
      skipWaiting: true,
      runtimeCaching: [
        {
          urlPattern: /\/api\/transactions/,
          handler: 'NetworkFirst',
          options: { cacheName: 'transactions-cache', networkTimeoutSeconds: 3 },
        },
        {
          urlPattern: /\/api\/transactions/,
          handler: 'NetworkOnly',
          options: { backgroundSync: { name: 'transactions-queue', options: { maxRetentionTime: 24 * 60 } } },
        },
        {
          urlPattern: /\/api\/budgets/,
          handler: 'NetworkFirst',
          options: { cacheName: 'budgets-cache', networkTimeoutSeconds: 3 },
        },
        {
          urlPattern: /\/api\/budgets/,
          handler: 'NetworkOnly',
          options: { backgroundSync: { name: 'budgets-queue', options: { maxRetentionTime: 24 * 60 } } },
        },
        // …any other static‐asset caching you want…
      ],
    }),
    new DotenvWebpackPlugin({ systemvars: true }),
  ],

  devServer: {
    static: './dist',
    historyApiFallback: {
      index: '/login.html',
      rewrites: [
        { from: /^\/login/, to: '/login.html' },
        { from: /^\/budget/, to: '/budget.html' },
        { from: /^\/register/, to: '/register.html' },
        { from: /^\/graphs/, to: '/graphs.html' },
      ],
    },
    proxy: {
      '/api': {
        target: process.env.API_BASE_URL,
        changeOrigin: true,
        secure: false,
      },
    },
    port: process.env.PORT || 4000,
    open: true,
  },
  performance: {
    hints: false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000,
  },
};
