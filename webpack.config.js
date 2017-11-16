const fs = require('fs')
const glob = require('glob')
const path = require('path')
const serverlessWebpack = require('serverless-webpack')
const webpack = require('webpack')
const webpackNodeExternals = require('webpack-node-externals')

const CWD = process.cwd()

const BUILD = path.resolve(CWD, 'build')
const SRC = path.resolve(CWD, 'src')

const PRODUCTION = process.env.NODE_ENV === 'production'

let plugins = []

if (!PRODUCTION) {
  plugins = plugins.concat([
    new webpack.EnvironmentPlugin(
      glob
        .sync(path.join(CWD, 'config/staging/*.config'))
        .reduce((result, file) => Object.assign(result, {
          [`CONFIG_${path.basename(file, '.json.config').toUpperCase()}`]: fs.readFileSync(file, 'utf-8')
        }), {})
    ),
    new webpack.EnvironmentPlugin({
      IS_OFFLINE: true,
      STAGE: 'staging'
    })
  ])
}

module.exports = {
  plugins,
  entry: serverlessWebpack.lib.entries,
  output: {
    libraryTarget: 'commonjs',
    path: BUILD,
    filename: '[name].js'
  },
  externals: [webpackNodeExternals()],
  target: 'node',
  watch: true,
  module: {
    loaders: [{
      test: /\.jsx?$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader'
      }
    }, {
      test: /\.json$/,
      loader: 'json-loader'
    }, {
      test: /\.ya?ml$/,
      loader: [
        'json-loader',
        'yaml-loader'
      ]
    }]
  },
  resolve: {
    alias: {
      config: `${SRC}/config`,
      constant: `${SRC}/constant`,
      service: `${SRC}/service`,
      lib: `${SRC}/lib`
    }
  }
}
