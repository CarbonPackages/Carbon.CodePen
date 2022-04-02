import * as monacoImport from 'monaco-editor';
import { configureMonacoTailwindcss } from 'monaco-tailwindcss';

// Required Js to initiate the workers created above.
window.MonacoEnvironment = {
    getWorkerUrl: (moduleId, label) => {
        switch (label) {
            case 'json':
                return new URL('language/json/json.worker.js', import.meta.url).pathname
            case 'css':
            case 'scss':
            case 'less':
                return new URL('language/css/css.worker.js', import.meta.url).pathname
            case 'html':
            case 'handlebars':
            case 'razor':
                return new URL('language/html/html.worker.js', import.meta.url).pathname
            case 'typescript':
            case 'javascript':
                return new URL('language/typescript/ts.worker.js', import.meta.url).pathname
            case 'editorWorkerService':
                return new URL('editor/editor.worker.js', import.meta.url).pathname
            case 'tailwindcss':
                return new URL('monaco-tailwindcss/tailwindcss.worker.js', import.meta.url).pathname
            default:
                throw new Error(`Unknown label ${label}`);
        }
    }
};

export const monaco = monacoImport
export const monacoTailwindCss = configureMonacoTailwindcss
