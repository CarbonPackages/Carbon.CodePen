import { PackageFrontendConfiguration } from "./manifest";
import * as monaco from "monaco-editor";
import {
    configureMonacoTailwindcss,
    MonacoTailwindcss,
} from "monaco-tailwindcss";
import { emmetHTML, emmetCSS } from "emmet-monaco-es";
import {
    conf as htmlConf,
    language as htmlLanguage,
    // @ts-expect-error
} from "monaco-editor/esm/vs/basic-languages/html/html";
import { registerDocumentationForFusionObjects } from "./registerDocumentationForFusionObjects";
import { registerCompletionForFusionObjects } from "./registerCompletionForFusionObjects";
import { afxMappedLanguageId } from "./afxMappedLanguageId";

declare global {
    interface Window {
        MonacoEnvironment?: monaco.Environment;
    }
}

let initialized: {
    monaco: typeof monaco;
    monacoTailwindCss?: MonacoTailwindcss;
};

export const initializeMonacoOnceFromConfig = (
    packageConfig: PackageFrontendConfiguration
) => {
    if (initialized) {
        return initialized;
    }

    initialized = { monaco };

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
                case "handlebars":
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

    monaco.languages.register({
        id: afxMappedLanguageId,
        extensions: [".afx"],
        aliases: ["AFX", "afx"],
        mimetypes: ["text/html"],
    });

    monaco.languages.registerTokensProviderFactory(afxMappedLanguageId, {
        create() {
            return htmlLanguage;
        },
    });
    monaco.languages.setLanguageConfiguration(afxMappedLanguageId, htmlConf);

    const fusionObjectsConfig = packageConfig.afx.fusionObjects;
    registerDocumentationForFusionObjects(
        monaco,
        fusionObjectsConfig,
        afxMappedLanguageId
    );
    registerCompletionForFusionObjects(
        monaco,
        fusionObjectsConfig,
        afxMappedLanguageId
    );

    if (packageConfig.tailwindcss.enabled) {
        initialized.monacoTailwindCss = configureMonacoTailwindcss({
            languageSelector: ["html", afxMappedLanguageId],
            // configTailwindcss.worker.ts handles the input.
            tailwindConfig: packageConfig.tailwindcss.clientConfig,
        });
    }

    emmetHTML(monaco, ["html", afxMappedLanguageId]);
    emmetCSS(monaco, ["css", "scss", "less"]);

    return initialized;
};
