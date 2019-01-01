const { resolve } = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const AsyncChunkNames = require('webpack-async-chunk-names-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const { DefinePlugin } = require('webpack')
// const { DefinePlugin } = require('webpack')
const devMode = process.env.NODE_ENV !== 'production'

const getPath = dir => resolve(__dirname, '..', dir)
const isUseEslint = true
const createEslintRule = () => ({
  test: /\.js$/,
  enforce: 'pre',
  use: {
    loader: 'eslint-loader',
    options: {
      formatter: require('eslint-friendly-formatter'),
      cache: true,
      emitWarning: false
    }
  },
  include: getPath('src')
})

module.exports = {
  context: getPath('./'),
  entry: './src/index.js',
  output: {
    filename: devMode ? '[name].js' : 'js/[name].[chunkhash:8].js',
    chunkFilename: devMode ? '[name].chunk.js' : 'js/[name].[chunkhash:8].chunk.js',
    path: getPath('dist'),
    publicPath: '/'
  },
  module: {
    rules: [
      ...(isUseEslint ? [createEslintRule()] : []),
    {
      test: /\.js$/,
      use: {
        loader: 'babel-loader'
      },
      include: getPath('src')
    }, {
      test: /\.(jpe?g|png|gif|svg|)(\?.*)?$/,
      loader: 'url-loader', options: {
        name: devMode ? 'images/[name].[ext]' : 'images/[name].[hash:8].[ext]',
        limit: 10000
      }
    }, {
      // if use scss
      test: /\.scss$/,
      use: [{
        loader: devMode ? 'style-loader' : MiniCssExtractPlugin.loader
      }, {
        loader: 'css-loader', options: {
          sourceMap: devMode
        }
      }, {
        loader: 'postcss-loader', options: {
          plugins: [
            require('autoprefixer')({
              browsers: [
                "> 1%",
                "last 2 versions",
                "not ie < 9"
              ]
            })
          ],
          sourceMap: devMode
        }
      },{
        loader: 'sass-loader', options: {
          sourceMap: devMode
        }
      }],
      exclude: /node_modules/
    }, {
      test: /\.(mp3|mp4|webm|ogg|wav|flac|acc)(\??.*)$/,
      loader: 'url-loader', options: {
        name: devMode ? 'media/[name].[ext]' : 'media/[name].[hash:8].[ext]',
        limit: 10000
      }
    }, {
      test: /\.(woff2?|eot|ttf|otf)(\??.*)/,
      loader: 'url-loader', options: {
        name: devMode ? 'fonts/[name].[ext]' : 'fonts/[name].[hash:8].[ext]',
        limit: 10000
      }
    }]
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      minSize: 0,
      minChunks: 1,
      maxAsyncRequests: 5,
      maxInitialRequests: 3,
      automaticNameDelimiter: '~',
      name: true,
      cacheGroups: {
        default: false,
        verdors: false,
        
        style: {
          priority: 10,
          test: /styled-components/,
          name: 'verdor~styled-components'
        },
        'react-dom': {
          chunks: 'initial',
          priority: 1,
          test: /react-dom/,
          name: 'verdor~react-dom'
        },
        verdor: {
          chunks: 'async',
          priority: -10,
          test: /node_modules/,
          name: 'verdor~all'
        }
      }
    },
    runtimeChunk: {
      name: 'runtime'
    }
  },
  performance: {
    hints: false
  },
  resolve: {
    alias: {
      '@': getPath('src')
    },
    extensions: ['.js', '.scss', '.json']
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: getPath('src/index.html'),
      inject: true,
      // minify: {
      //   removeComments: true,
      //   removeAttributeQuotes: true,
      //   collapseWhitespace: true
      // }
    }),
    new DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    }),
    // if you want to use scss/less/stylus
    new MiniCssExtractPlugin({
      filename: 'style/[name].[contenthash:8].css'
    }),
    new CleanWebpackPlugin(['dist'], {
        root: getPath('./'),
        verbose: true
      }
    ),
    // If you want to define global variables
    // new DefinePlugin({
    //   'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    // }),
    new AsyncChunkNames()
  ]
}
