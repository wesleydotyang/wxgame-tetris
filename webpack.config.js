const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = env => {
    if (!env) {
        env = {};
    }
    
    let config ={
        entry:  "./src/game.ts",
        output: {
        path: __dirname + "/dist",//打包后的文件存放的地方
        filename: "game.js"//打包后输出文件的文件名
        },
        devtool: 'source-map',
        devServer: {
            contentBase: "./dist",//本地服务器所加载的页面所在的目录
            historyApiFallback: true,//不跳转
            inline: true//实时刷新
        },
        resolve:{
            extensions: ['.ts', '.js'],
            symlinks: false
        },
        module: {
            rules: [
                // {
                //     test: /(\.jsx|\.js)$/,
                //     use: {
                //         loader: "babel-loader",
                //     },
                //     exclude: /node_modules/
                // },
                {
                    test: /\.tsx?$/,
                    use: {
                        loader: "ts-loader",
                    },
                    exclude: /node_modules/
                }
            ]
        },
        plugins:[
            new webpack.DefinePlugin({
                'IS_WX': JSON.stringify(!!env.wx)
            }),
            new CopyWebpackPlugin([
                'game.json',
                'project.config.json',
                {from:'src/openDataContext',to:'openDataContext'}
            ])

        ]
    }

    if(!env.wx){
        config.plugins.push(new HtmlWebpackPlugin())
    }

    return config
    
  }