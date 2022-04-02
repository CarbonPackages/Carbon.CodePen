const path = require('path')

module.exports = {

    // webpack is not made for dynamic imports at runtime (a second build that doesnt know from the first one)
    // why do we need this? because the babel version and the bildstark of neos ui plugins, that we need to use doesnt work
    // with Monacos modern? syntax and i couldn't get it to work.

    // Font doesnt work (for icons)
    // Failed to decode downloaded font
    // OTS parsing error: invalid sfntVersion:

    // using esm modules from webpack wont work this way, as the workers will then also be esm modules and this wont work.
    // Uncaught SyntaxError: Cannot use import statement outside a module
    //
    // const {default: monaco} = await import(/* webpackIgnore: true */this.props.monacoEditorInclude)
    //
    // experiments.outputModule: true
    // output.library.type: 'module'

    // using to require at runtime doesnt for type 'umd'
    //
    // output.library.type: 'umd'
    //
    // would only work when using it directly by webpack again
    //      -> which doesnt work because `import.meta.url` doesnt work in the old babel ui
    //      -> worker urls messed up
    //      -> needs __webpack_public_path__ = 'http://127.0.0.1:8081/_Resources/Static/Packages/Carbon.CodeEditor/Plugin/'
    //
    // returns an empty esm import:
    // import(/* webpackIgnore: true */...)
    // Module {Symbol(Symbol.toStringTag): 'Module'}
    //
    // require(...)
    // Error: Cannot find module

    // using window to transfer the data:
    // see `loadMonaco.js` from 3e2f7358343503b8334fefdbc2b326c1d37f30be
    //
    // output.library: 'monaco'
    // or window.monaco = monaco
    // Uncaught SyntaxError: Cannot use import statement outside a module
    // workers dont work.
    // but best webpack option so far - many console.errors and html worker doesnt work

    entry: './src/webpack_index.js',
    mode: 'development',
    output: {
        path: path.resolve(__dirname, '../../Public/Monaco'),
        filename: 'index.js',
        library: 'monaco'
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.ttf$/,
                use: ['file-loader']
            }
        ]
    },
};
