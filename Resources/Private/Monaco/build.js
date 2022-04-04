 const esbuild = require('esbuild');
const path = require('path');

const outputDir = path.join(__dirname, '../../Public/Monaco')

const workerEntryPoints = [
  'language/json/json.worker.js',
  'language/css/css.worker.js',
  'language/html/html.worker.js',
  'language/typescript/ts.worker.js',
  'editor/editor.worker.js'
];

build({
  entryPoints: workerEntryPoints.map(entry => require.resolve(`monaco-editor/esm/vs/${entry}`)),
  outdir: outputDir,
  bundle: true,
  format: 'iife',
  minify: true
});

build({
  // watch: true,
  entryPoints: [require.resolve('monaco-tailwindcss/tailwindcss.worker.ts')],
  outfile: path.join(outputDir, 'monaco-tailwindcss/tailwindcss.worker.js'),
  bundle: true,
  sourcemap: 'inline',
  format: 'iife',
  minify: false,
});

build({
  // watch: true,
  minify: true,
  entryPoints: ['src/index.js'],
  bundle: true,
  format: 'esm',
  // format: 'iife', // then we must use document.currentScript.src instead of import.meta.src
  // splitting: true, // optional and only works for esm
  banner: {
    // dirtily injects the style.css - todo find a better way.
    js: `
        (function () {
            const link = document.createElement('link')
            link.rel = "stylesheet"
            link.href = (new URL("index.css", import.meta.url)).pathname
            document.head.append(link)
        })();
    `,
  },
  outdir: outputDir,
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
