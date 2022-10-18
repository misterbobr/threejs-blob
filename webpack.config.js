const path = require('path');

module.exports = {
    entry: './src/js/three.js',
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, 'src'),
        // library: 'three',
    },
    module: {
        rules: [
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resourse',
            },
        ],
    },
    watch: true,
    mode: 'development'
    // mode: 'production'
}