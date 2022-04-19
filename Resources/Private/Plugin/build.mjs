import { createRequire } from "module";
import esbuild from "esbuild";
import { languages } from "monaco-editor/esm/metadata.js";
import { neosUiExtensibility } from "@mhsdesign/esbuild-neos-ui-extensibility";
import { fileURLToPath } from "url";
import { writeFile } from "fs/promises";

const require = createRequire(import.meta.url);

const outdir = "../../Public/Plugin";

const includedLanguages = [
    "yaml",
    "json",
    "html",
    "css",
    "scss",
    "less",
    "ini",
    "js",
    "typescript",
    "xml",
    "markdown",
];

const handleBuild = (result) => {
    if (result.errors.length > 0) {
        console.error(result.errors);
    }
    if (result.warnings.length > 0) {
        console.error(result.warnings);
    }
    console.info("build done");
};

esbuild
    .build({
        watch: process.argv.includes("--watch"),
        logLevel: "info",
        minify: true,
        bundle: true,
        splitting: true,
        format: "esm",
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
    })
    .then(handleBuild);

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
            }).map(([outfile, entry]) => [outfile, require.resolve(entry)])
        ),
        outdir,
        bundle: true,
        format: "iife",
        minify: true,
    })
    .then(handleBuild);

esbuild
    .build({
        entryPoints: ["./src/extensibletailwind.worker.ts"],
        outdir: "../../Public",
        bundle: true,
        // cjs makes it possible to consume this via bundler and use the exported `initializeFromStaticConfig`
        // and use this also in the browser, as this is bundled
        format: "cjs",
        minify: true,
        banner: {
            // in case this will be run in the browser directly we stub the module.
            js: `if (typeof module === "undefined") var module = {};`,
        },
    })
    .then(handleBuild);

// esbuild doesnt support the generation of "d.ts" yet
// todo use tsc
writeFile(
    "../../Public/extensibletailwind.worker.d.ts",
    `
import { TailwindConfig } from "tailwindcss/tailwind-config";

/**
 * Initializes the worker with the passed tailwindConfig
 * If this function is not called, this worker will initialize without embedded config
 *
 * @param {TailwindConfig} tailwindConfig will be embedded into the the webworker
 *
 * @example
 * import config from "./tailwind.config.js";
 * initializeFromStaticConfig(config);
 *
 * @api
 */
export function initializeFromStaticConfig(
    tailwindConfig: TailwindConfig
): void;
`.trimStart()
);
