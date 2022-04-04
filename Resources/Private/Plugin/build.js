
const esbuild = require('esbuild');
const path = require('path');

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

esbuild.build({
    watch: process.argv.includes('--watch'),
    logLevel: "info",
    // sourcemap: true,
    minify: true,
    bundle: true,
    format: 'iife',
    entryPoints: {
        'Plugin': 'src/index.js'
    },
    outdir: path.join(__dirname, '../../Public/Plugin'),
    loader: {
        // we use tsx to get the decorators from typescript + jsx support
        '.js': 'tsx',
    },
    plugins: [
        {
            name: 'neosUiConsumerApi',
            setup({ onResolve, resolve }) {
                Object.entries(neosUiConsumerApi).forEach(([path, alias]) => {
                    onResolve({ filter: RegExp(`^${path}/?$`) }, ({ path, ...options }) =>
                        resolve(alias, options)
                    );
                })
            },
        }
    ],
}).then((result) => {
    if (result.errors.length > 0) {
        console.error(result.errors);
    }
    if (result.warnings.length > 0) {
        console.error(result.warnings);
    }
    console.info("build done")
})
