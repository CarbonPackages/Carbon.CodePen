import { createRequire } from "module";
import esbuild from "esbuild";
import { languages } from "monaco-editor/esm/metadata.js";
import { neosUiExtensibility } from "@mhsdesign/esbuild-neos-ui-extensibility";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);

const outdir = "../../Public/Plugin";
const production = process.argv.includes("--production");

const includedLanguages = [
    // afx too but this is not a monaco basic language
    "yaml",
    "json",
    "html",
    "css",
    "scss",
    "less",
    "ini",
    "javascript",
    "typescript",
    "xml",
    "markdown",
    "php",
];

esbuild
    .build({
        watch: process.argv.includes("--watch"),
        logLevel: "info",
        minify: true,
        sourcemap: true,
        bundle: true,
        splitting: true,
        format: "esm",
        target: "es2020",
        entryPoints: {
            Plugin: "src/index.ts",
        },
        outdir,
        loader: {
            // monaco icon font
            ".ttf": "file",
        },
        plugins: [
            neosUiExtensibility(),
            {
                name: "carbonMagic",
                setup({ onResolve, resolve }) {
                    // following code is optional, and is non breaking when upstream changes (eg. we would then just include all languages again)
                    const basicLanguages = languages.map(({ label }) => label);
                    const basicLanguagesToExclude = basicLanguages.filter(
                        (language) =>
                            includedLanguages.includes(language) === false
                    );

                    // make sure that monaco is not include twice.
                    onResolve(
                        { filter: /^monaco-editor(\/.*)?$/, namespace: "file" },
                        ({ path, ...options }) =>
                            resolve(path, {
                                ...options,
                                resolveDir: fileURLToPath(
                                    new URL(".", import.meta.url)
                                ),
                                namespace: "noRecurse",
                            })
                    );

                    // all languages imports will look like: './html/html.contribution.js' -> and those who are not in `includedLanguages` will be ignored
                    onResolve(
                        {
                            filter: RegExp(
                                `^\\.\\/(${basicLanguagesToExclude.join(
                                    "|"
                                )})\\/(${basicLanguagesToExclude.join(
                                    "|"
                                )})\\.contribution\\.js$`
                            ),
                        },
                        ({ path }) => ({
                            path,
                            external: true,
                            sideEffects: false,
                        })
                    );
                },
            },
        ],
    });

esbuild
    .build({
        entryPoints: Object.fromEntries(
            Object.entries({
                "json.worker":
                    "monaco-editor/esm/vs/language/json/json.worker.js",
                "css.worker": "monaco-editor/esm/vs/language/css/css.worker.js",
                "html.worker":
                    "monaco-editor/esm/vs/language/html/html.worker.js",
                "ts.worker":
                    "monaco-editor/esm/vs/language/typescript/ts.worker.js",
                "editor.worker": "monaco-editor/esm/vs/editor/editor.worker.js",
                "configTailwindcss.worker": "./src/configTailwindcss.worker.ts",
            }).map(([outfile, entry]) => [outfile, require.resolve(entry)])
        ),
        outdir,
        bundle: true,
        format: "iife",
        minify: production,
    });
