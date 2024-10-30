const path = require('path'); 
module.exports = {
    mode: 'development',
    entry: './ts/main.ts',
    output: {
        filename: 'index.js',
        path:  path.resolve(__dirname, 'out'),
        publicPath: '/out/'
    },
    module: {
        rules: [
            {
                test: /\.ts?$/,
                use: [
                    {
                        loader: 'ts-loader'
                    }
                ],
                exclude: /(?:node_modules)/,
            },
        ]
    },
    resolve: {
        modules: [
            'ts',
            'node_modules'
        ],
        extensions: [
            '.js',
            '.ts'
        ]
    } 
 };