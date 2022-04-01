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
    format: 'esm',
    banner: {
        //
        // Injects the style.css
        //
        js: `
        (function () {
            const link = document.createElement('link')
            link.rel = "stylesheet"
            link.href = (new URL("index.css", import.meta.url)).href
            document.head.append(link)
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
