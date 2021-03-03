const path = require("path");
const { VueLoaderPlugin } = require('vue-loader');

const devMode = (process.env.NODE_ENV != 'production');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin')

const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    mode: process.env.NODE_ENV,
    entry: "./src/js/index.js",
    output: {
        path: path.resolve(__dirname, "./dist/js"),
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                use:[
                    {
                        loader: 'vue-loader',
                        options: {
                            loaders: {
                                // Since sass-loader (weirdly) has SCSS as its default parse mode, we map
                                // the "scss" and "sass" values for the lang attribute to the right configs here.
                                // other preprocessors should work out of the box, no loader config like this necessary.
                                'scss': [
                                    (devMode) ? 'vue-style-loader' : MiniCssExtractPlugin.loader
                                    ,'css-loader'
                                    ,'sass-loader'
                                ],
                                'sass': [
                                    (devMode) ? 'vue-style-loader' : MiniCssExtractPlugin.loader
                                    ,'css-loader'
                                    ,'sass-loader?indentedSyntax'
                                ]
                            }
                            // other vue-loader options go here
                        }
                    },
                    {
                        loader: 'vue-svg-inline-loader'
                    }
                ]
            },
            {
                test: /\.js$/,
                exclude: /(node_modules)/,
                use: {
                  loader: "babel-loader",
                  options: {
                    presets: ["babel-preset-env"]
                  }
                }
            },
            {
                test: /\.aml$/,
                exclude: /(node_modules)/,
                use: {
                    loader: "@newsdev/archieml-loader"
                }
            },
            {
                test: /\.css$/,
                use: [
                    (devMode) ? 'style-loader' : MiniCssExtractPlugin.loader
                    , 'css-loader'
                ]
            },
            {
                test: /\.scss$/,
                use: [
                    (devMode) ? 'vue-style-loader' : MiniCssExtractPlugin.loader
                    ,'css-loader'
                    ,'sass-loader'
                ],
            },
            {
                test: /\.sass$/,
                use: [
                    (devMode) ? 'vue-style-loader' : MiniCssExtractPlugin.loader
                    ,'css-loader'
                    ,'sass-loader'
                ],
            },
            {
                test: /\.(png|jpg|gif|svg)$/,
                loader: 'file-loader',
                options: {
                    name: '[name].[ext]'
                }
            },
            {
                test: /\.(eot|woff|woff2|ttf|svg|otf)$/,
                loader: 'url-loader?limit=30000&name=[name]-[hash].[ext]'
            }
        ]
    },
    resolve: {
        alias: {
            'vue$': 'vue/dist/vue.esm.js'
        }
    },
    devServer: {
        historyApiFallback: true,
        noInfo: true
    },
    performance: {
        hints: false
    },
    devtool: '#eval-source-map',
    plugins: [
        new VueLoaderPlugin(),
    ]
};

// Make sure to set the NODE_ENV environment variable to 'production'
// when building for production!
if (process.env.NODE_ENV === 'production') {
    // Use standard source mapping instead of eval-source-map.
    module.exports.devtool = '#source-map';

    // http://vue-loader.vuejs.org/en/workflow/production.html
    // Add these plugins:
    module.exports.plugins = (module.exports.plugins || []).concat([
        // Let's your app access the NODE_ENV variable via. window.process.env.
        new CopyPlugin([
            { from: 'img', to: 'img'},
            { from: 'aml', to: 'aml'}
        ]),
        new MiniCssExtractPlugin({
            filename: '../css/style.css',
            // path: path.resolve(__dirname, "./dist/css"),
        }),
    ]);

    module.exports.optimization = {
        splitChunks:{
            cacheGroups: {
                commons: {
                    test: /[\\/]node_modules[\\/].*\.js$/,
                    name: "vendors",
                    chunks: "all"
                }
            }
        },
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    compress: {
                        drop_console: true
                    }
                }
            })
        ]
    }
}
