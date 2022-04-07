import { getPackageFrontendConfiguration } from './manifest'
import * as monaco from 'monaco-editor';
import { configureMonacoTailwindcss } from 'monaco-tailwindcss';
import { emmetHTML as monacoEmmetHTML } from 'emmet-monaco-es'

// Required Js to initiate the workers created above.
window.MonacoEnvironment = {
    getWorkerUrl: (moduleId, label) => {
        switch (label) {
            case 'json':
                return new URL('json.worker.js', import.meta.url).pathname
            case 'css':
            case 'scss':
            case 'less':
                return new URL('css.worker.js', import.meta.url).pathname
            case 'html':
            case 'handlebars':
            case 'razor':
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

let initialized = false;

export const initializeMonaco = () => {
    if (initialized) {
        return monaco;
    }

    const packageConfig = getPackageFrontendConfiguration();

    let monacoTailwindcssOptions = {
        languageSelector: ['html', 'javascript'],
        config: {}
    }

    if (packageConfig.clientTailwindConfig) {
        monacoTailwindcssOptions.config = JSON.parse(packageConfig.clientTailwindConfig)
    }
    configureMonacoTailwindcss(monacoTailwindcssOptions)

    monacoEmmetHTML(monaco, ['html', 'php'])

    initialized = true;
    return monaco;
}
