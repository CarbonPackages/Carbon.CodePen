import {createRequire} from 'module'
import esbuild from 'esbuild'
import { languages } from 'monaco-editor/esm/metadata.js'
import { neosUiExtensibility } from '@mhsdesign/esbuild-neos-ui-extensibility'

const require = createRequire(import.meta.url);

const outdir = '../../Public/Plugin'

const includedLanguages = [
    'yaml', 'json', 'html', 'css', 'scss', 'less', 'ini', 'js', 'typescript', 'xml', 'markdown'
]

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
        'Plugin': 'src/index.ts'
    },
    outdir,
    loader: {
        // monaco icon font
        '.ttf': 'file'
    },
    plugins: [
        neosUiExtensibility(),
        {
            name: 'carbonMagic',
            setup({ onResolve }) {
                // following code is optional, and is non breaking when upstream changes (eg. we would then just include all languages again)
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