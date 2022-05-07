import { PackageFrontendConfiguration } from "./manifest";
import * as monaco from "monaco-editor";
import { configureMonacoTailwindcss } from "monaco-tailwindcss";
import { emmetHTML, emmetCSS } from "emmet-monaco-es";
import {
    conf as htmlConf,
    language as htmlLanguage,
} from "monaco-editor/esm/vs/basic-languages/html/html";
import { registerDocumentationForFusionObjects } from "./registerDocumentationForFusionObjects";
import { registerCompletionForFusionObjects } from "./registerCompletionForFusionObjects";

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
                    return new URL("editor.worker.js", import.meta.url)
                        .pathname;
                case "tailwindcss":
                    return new URL(
                        "configTailwindcss.worker.js",
                        import.meta.url
                    ).pathname;
                default:
                    throw new Error(`Unknown label ${label}`);
            }
        },
    };

    // we map `afx` to `twig` as we dont support twig, but twig has better 3rd party support

    monaco.languages.register({
        id: "twig",
        extensions: [".afx"],
        aliases: ["AFX", "afx"],
        mimetypes: ["text/html"],
    });

    monaco.languages.registerTokensProviderFactory("twig", {
        create() {
            return htmlLanguage;
        },
    });
    monaco.languages.setLanguageConfiguration("twig", htmlConf);

    const fusionObjectsConfig = packageConfig.afx.fusionObjects;
    registerDocumentationForFusionObjects(monaco, fusionObjectsConfig, "twig");
    registerCompletionForFusionObjects(monaco, fusionObjectsConfig, "twig");

    initializeTailwind(packageConfig, ["html", "twig"]);

    emmetHTML(monaco, ["html", "twig"]);
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
        // configTailwindcss.worker.ts handles the input.
        tailwindConfig: packageConfig.tailwindcss.clientConfig,
    });
};
