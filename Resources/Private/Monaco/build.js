//@ts-check

const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');

removeDir('../../Public/Monaco');

const workerEntryPoints = [
    'vs/language/json/json.worker.js',
    'vs/language/css/css.worker.js',
    'vs/language/html/html.worker.js',
    'vs/language/typescript/ts.worker.js',
    'vs/editor/editor.worker.js'
];

build({
    entryPoints: workerEntryPoints.map((entry) => `node_modules/monaco-editor/esm/${entry}`),
    bundle: true,
    format: 'iife',
    outbase: 'node_modules/monaco-editor/esm/',
    outdir: path.join(__dirname, '../../Public/Monaco'),
    minify: true
});

build({
    minify: true,
    entryPoints: ['src/index.js'],
    bundle: true,
    format: 'iife',
    banner: {
        //
        // Required Js to initiate the workers created above.
        // Also injects the style.css
        //
        js: `
        (function () {

            function dirname(path) {
                const match = path.match(/.*\\//);
                if (match === null) {
                    return '';
                }
                return match[0];
            }

            currentFolder = dirname(document.currentScript.src);
            const link = document.createElement('link')
            link.rel = "stylesheet"
            link.href = currentFolder + "index.css"
            document.head.append(link)

            window.MonacoEnvironment = {
                getWorkerUrl: function (moduleId, label) {
                    if (label === 'json') {
                        return currentFolder + 'vs/language/json/json.worker.js';
                    }
                    if (label === 'css' || label === 'scss' || label === 'less') {
                         return currentFolder + 'vs/language/css/css.worker.js';
                    }
                    if (label === 'html' || label === 'handlebars' || label === 'razor') {
                        return currentFolder + 'vs/language/html/html.worker.js';
                    }
                    if (label === 'typescript' || label === 'javascript') {
                        return currentFolder + 'vs/language/typescript/ts.worker.js';
                    }
                    return currentFolder + 'vs/editor/editor.worker.js';
                }
            };
        })();
    `,
    },
    outdir: path.join(__dirname, '../../Public/Monaco'),
    loader: {
        '.ttf': 'file'
    }
});

/**
 * @param {import ('esbuild').BuildOptions} opts
 */
function build(opts) {
    esbuild.build(opts).then((result) => {
        if (result.errors.length > 0) {
            console.error(result.errors);
        }
        if (result.warnings.length > 0) {
            console.error(result.warnings);
        }
        console.info("build done")
    });
}

/**
 * Remove a directory and all its contents.
 * @param {string} _dirPath
 */
function removeDir(_dirPath) {
    const dirPath = path.join(__dirname, _dirPath);
    if (!fs.existsSync(dirPath)) {
        return;
    }
    fs.rm(dirPath, { recursive: true }, (err) => {
        if (err) {
            throw err;
        }
        console.info(`removed ${_dirPath}`)
    })
}
