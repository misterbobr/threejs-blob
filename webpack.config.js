const path = require('path');

module.exports = {
    entry: './src/js/three.js',
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, 'src'),
        // library: 'three',
    },
    watch: true,
    mode: 'development'
    // mode: 'production'
}