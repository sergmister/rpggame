const path = require("path");
const webpack = require("webpack");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { InjectManifest } = require("workbox-webpack-plugin");

/** @type {import("webpack").Configuration} */
module.exports = {
  entry: { main: "./src/main.ts" },
  mode: "production",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].[contenthash].bundle.js",
    chunkFilename: "[name].[contenthash].chunk.js",
    clean: true,
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        // create one chunk for all dependencies
        // commons: {
        //   test: /[\\/]node_modules[\\/]/,
        //   name: "vendors",
        //   chunks: "all",
        //   filename: "[name].[contenthash].bundle.js",
        // },
      },
    },
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
    alias: {
      src: path.resolve(__dirname, "src"),
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$|\.jsx?$/,
        include: path.join(__dirname, "src"),
        loader: "ts-loader",
        options: { configFile: "tsconfig.webpack.json" },
      },
    ],
  },
  plugins: [
    new webpack.ProgressPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        { from: "public", to: "" },
        { from: "pwa", to: "" },
      ],
    }),
    new HtmlWebpackPlugin({
      filename: "index.html",
      template: "src/index.html",
      chunks: ["main"],
    }),
    new InjectManifest({
      swSrc: path.resolve(__dirname, "pwa/sw.js"),
      swDest: "sw.js",
    }),
  ],
};
