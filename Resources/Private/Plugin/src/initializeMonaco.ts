import { getPackageFrontendConfiguration, PackageFrontendConfiguration } from './manifest'
import * as monaco from 'monaco-editor';
import { configureMonacoTailwindcss } from 'monaco-tailwindcss';
import { emmetHTML, emmetCSS } from 'emmet-monaco-es'

declare global {
    interface Window {
        MonacoEnvironment: monaco.Environment;
    }
}

// Required Js to initiate the workers created above.
window.MonacoEnvironment = {
    getWorkerUrl(moduleId, label) {
        switch (label) {
            case 'json':
                return new URL('json.worker.js', import.meta.url).pathname
            case 'css':
            case 'scss':
            case 'less':
                return new URL('css.worker.js', import.meta.url).pathname
            case 'html':
                return new URL('html.worker.js', import.meta.url).pathname
            case 'typescript':
            case 'javascript':
                return new URL('ts.worker.js', import.meta.url).pathname
            case 'editorWorkerService':
                return new URL('editor.worker.js', import.meta.url).pathname
            case 'tailwindcss':
                return new URL('tailwindcss.worker.js', import.meta.url).pathname
            default:
                throw new Error(`Unknown label ${label}`);
        }
    }
};

const initializeTailwind = (packageConfig: PackageFrontendConfiguration, languageSelector: string[]) => {
    const clientTailwindConfig = packageConfig.clientTailwindConfig;
    if (typeof clientTailwindConfig !== "string" || clientTailwindConfig.length === 0) {
        return
    }
    // enable tailwind support.
    let config;
    try {
        config = JSON.parse(clientTailwindConfig)
        if (typeof config !== "object" || config === null) {
            throw Error("Config is not a JS object.");
        }
    } catch (_e) {
        const e = _e as Error;
        console.error(`Carbon.CodeEditor: 'clientTailwindConfig' is not valid JSON object.${e.message}`)
        console.warn(clientTailwindConfig)
        return
    }
    const monacoTailwindcssOptions = {
        languageSelector,
        config
    }
    configureMonacoTailwindcss(monacoTailwindcssOptions)
}

let initialized = false;

export const initializeMonaco = (): typeof monaco => {
    if (initialized) {
        return monaco;
    }
    initialized = true;

    const packageConfig = getPackageFrontendConfiguration();

    initializeTailwind(packageConfig, ['html'])

    emmetHTML(monaco, ['html'])
    emmetCSS(monaco, ['css', 'scss', 'less'])

    return monaco;
}
