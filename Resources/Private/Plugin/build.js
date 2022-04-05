
const esbuild = require('esbuild');
const {join} = require('path');
const {languages} = require('monaco-editor/esm/metadata.js');

const neosUiConsumerApi = {
    'react': '@neos-project/neos-ui-extensibility/src/shims/vendor/react/index',
    'react-dom': '@neos-project/neos-ui-extensibility/src/shims/vendor/react-dom/index',
    'react-dnd': '@neos-project/neos-ui-extensibility/src/shims/vendor/react-dnd/index',
    'react-dnd-html5-backend': '@neos-project/neos-ui-extensibility/src/shims/vendor/react-dnd-html5-backend/index',
    'prop-types': '@neos-project/neos-ui-extensibility/src/shims/vendor/prop-types/index',
    'plow-js': '@neos-project/neos-ui-extensibility/src/shims/vendor/plow-js/index',
    'classnames': '@neos-project/neos-ui-extensibility/src/shims/vendor/classnames/index',
    'react-redux': '@neos-project/neos-ui-extensibility/src/shims/vendor/react-redux/index',
    'redux-actions': '@neos-project/neos-ui-extensibility/src/shims/vendor/redux-actions/index',
    'redux-saga/effects': '@neos-project/neos-ui-extensibility/src/shims/vendor/redux-saga-effects/index',
    'redux-saga': '@neos-project/neos-ui-extensibility/src/shims/vendor/redux-saga/index',
    'reselect': '@neos-project/neos-ui-extensibility/src/shims/vendor/reselect/index',
    '@friendsofreactjs/react-css-themr': '@neos-project/neos-ui-extensibility/src/shims/vendor/react-css-themr/index',
    'ckeditor5-exports': '@neos-project/neos-ui-extensibility/src/shims/vendor/ckeditor5-exports/index',

    '@neos-project/react-ui-components': '@neos-project/neos-ui-extensibility/src/shims/neosProjectPackages/react-ui-components/index',
    '@neos-project/neos-ui-backend-connector': '@neos-project/neos-ui-extensibility/src/shims/neosProjectPackages/neos-ui-backend-connector/index',
    '@neos-project/neos-ui-ckeditor5-bindings': '@neos-project/neos-ui-extensibility/src/shims/neosProjectPackages/neos-ui-ckeditor5-bindings/index',
    '@neos-project/neos-ui-decorators': '@neos-project/neos-ui-extensibility/src/shims/neosProjectPackages/neos-ui-decorators/index',
    '@neos-project/neos-ui-editors': '@neos-project/neos-ui-extensibility/src/shims/neosProjectPackages/neos-ui-editors/index',
    '@neos-project/neos-ui-i18n': '@neos-project/neos-ui-extensibility/src/shims/neosProjectPackages/neos-ui-i18n/index',
    '@neos-project/neos-ui-redux-store': '@neos-project/neos-ui-extensibility/src/shims/neosProjectPackages/neos-ui-redux-store/index',
    '@neos-project/neos-ui-views': '@neos-project/neos-ui-extensibility/src/shims/neosProjectPackages/neos-ui-views/index',
    '@neos-project/neos-ui-guest-frame': '@neos-project/neos-ui-extensibility/src/shims/neosProjectPackages/neos-ui-guest-frame/index',
    '@neos-project/utils-redux': '@neos-project/neos-ui-extensibility/src/shims/neosProjectPackages/utils-redux/index'
}

const outdir = join(__dirname, '../../Public/Plugin')

const handleBuild = result => {
    if (result.errors.length > 0) {
        console.error(result.errors);
    }
    if (result.warnings.length > 0) {
        console.error(result.warnings);
    }
    console.info("build done")
}

esbuild.build({
    watch: process.argv.includes('--watch'),
    logLevel: "info",
    minify: true,
    bundle: true,
    splitting: true,
    format: 'esm',
    entryPoints: {
        'Plugin': 'src/index.js'
    },
    outdir,
    loader: {
        // we use tsx to get the decorators from typescript + jsx support
        '.js': 'tsx',
        // monaco icon font
        '.ttf': 'file'
    },
    plugins: [
        {
            name: 'carbonMagic',
            setup({ onResolve, resolve }) {
                // neos ui consumer api:
                // trailing slash / will be tolerated -> as did the webpack impl.
                const paths = Object.keys(neosUiConsumerApi)
                onResolve({ filter: RegExp(`^(${paths.join('|')})/?$`) }, ({ path, ...options }) =>
                    resolve(neosUiConsumerApi[path.replace(/\/$/, '')], options)
                );

                // following code is optional, and is non breaking when upstream changes (eg. we would then just include all languages again)
                const includedLanguages = [
                    'javascript', 'css', 'html'
                ]
                const basicLanguages = languages.map(({label}) => label)
                const basicLanguagesToExclude = basicLanguages.filter(language => includedLanguages.includes(language) === false)

                // all languages imports will look like: './html/html.contribution.js' -> and those who are not in `includedLanguages` will be ignored
                onResolve({ filter: RegExp(`^\\.\\/(${basicLanguagesToExclude.join('|')})\\/(${basicLanguagesToExclude.join('|')})\\.contribution\\.js$`) }, ({path}) => ({
                    path,
                    external: true,
                    sideEffects: false,
                }));
            },
        }
    ],
}).then(handleBuild)

esbuild.build({
    entryPoints: Object.fromEntries(Object.entries({
        // type="module" is not supported by the NeosUi plugin includes:
        // Neos.Neos.Ui.resources.javascript.'Carbon.CodeEditor:Plugin'.type: 'module'
        // so we roll ourselves
        // 'esm-plugin.loader': './src/esm-plugin.loader.js',
        'esm-plugin.loader': './src/esm-plugin.loader.js',

        'json.worker': 'monaco-editor/esm/vs/language/json/json.worker.js',
        'css.worker': 'monaco-editor/esm/vs/language/css/css.worker.js',
        'html.worker': 'monaco-editor/esm/vs/language/html/html.worker.js',
        'ts.worker': 'monaco-editor/esm/vs/language/typescript/ts.worker.js',
        'editor.worker': 'monaco-editor/esm/vs/editor/editor.worker.js',
        'tailwindcss.worker': 'monaco-tailwindcss/tailwindcss.worker.js'
    }).map(([outfile, entry]) => [outfile, require.resolve(entry)])),
    outdir,
    bundle: true,
    format: 'iife',
    minify: true
}).then(handleBuild)
