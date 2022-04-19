import { PackageFrontendConfiguration } from "./manifest";
import * as monaco from "monaco-editor";
import { configureMonacoTailwindcss } from "monaco-tailwindcss";
import { emmetHTML, emmetCSS } from "emmet-monaco-es";
import { TailwindConfig } from "tailwindcss/tailwind-config";

declare global {
    interface Window {
        MonacoEnvironment?: monaco.Environment;
    }
}

let initialized = false;

export const initializeMonacoOnceFromConfig = (
    packageConfig: PackageFrontendConfiguration
): typeof monaco => {
    if (initialized) {
        return monaco;
    }
    initialized = true;

    window.MonacoEnvironment = {
        getWorkerUrl(_workerId, label) {
            switch (label) {
                case "json":
                    return new URL("json.worker.js", import.meta.url).pathname;
                case "css":
                case "scss":
                case "less":
                    return new URL("css.worker.js", import.meta.url).pathname;
                case "html":
                    return new URL("html.worker.js", import.meta.url).pathname;
                case "typescript":
                case "javascript":
                    return new URL("ts.worker.js", import.meta.url).pathname;
                case "editorWorkerService":
                    return new URL("editor.worker.js", import.meta.url).pathname;
                case "tailwindcss":
                    return packageConfig.tailwindcss.workerUri;
                default:
                    throw new Error(`Unknown label ${label}`);
            }
        },
    };

    initializeTailwind(packageConfig, ["html"]);

    emmetHTML(monaco, ["html"]);
    emmetCSS(monaco, ["css", "scss", "less"]);

    return monaco;
};

const initializeTailwind = (
    packageConfig: PackageFrontendConfiguration,
    languageSelector: string[]
) => {
    if (!packageConfig.tailwindcss.enabled) {
        return;
    }
    configureMonacoTailwindcss({
        languageSelector,
        tailwindConfig: parseOptionalTailwindConfig(packageConfig.tailwindcss.clientConfig),
    });
};

const parseOptionalTailwindConfig = (rawConfig: string | undefined): TailwindConfig | undefined => {
    if (!rawConfig) {
        return undefined;
    }
    try {
        const tailwindConfig = JSON.parse(rawConfig);
        if (typeof tailwindConfig !== "object" || tailwindConfig === null) {
            throw Error("Config is not a JS object.");
        }
        return tailwindConfig as TailwindConfig;
    } catch (e) {
        console.error(
            `Carbon.CodeEditor: 'tailwindcss.clientConfig' is not valid JSON object.${
                (e as Error).message
            }`
        );
        console.warn(rawConfig);
        return undefined;
    }
};
