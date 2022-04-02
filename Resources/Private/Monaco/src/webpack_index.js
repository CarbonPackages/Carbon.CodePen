import * as monaco from 'monaco-editor';

// Required Js to initiate the workers created above.
window.MonacoEnvironment = {
    getWorkerUrl: (moduleId, label) => {
        switch (label) {
            case 'json':
                return new URL('monaco-editor/esm/vs/language/json/json.worker.js', import.meta.url).pathname
            case 'css':
            case 'scss':
            case 'less':
                return new URL('monaco-editor/esm/vs/language/css/css.worker.js', import.meta.url).pathname
            case 'html':
            case 'handlebars':
            case 'razor':
                return new URL('monaco-editor/esm/vs/language/html/html.worker.js', import.meta.url).pathname
            case 'typescript':
            case 'javascript':
                return new URL('monaco-editor/esm/vs/language/typescript/ts.worker.js', import.meta.url).pathname
            case 'editorWorkerService':
                return new URL('monaco-editor/esm/vs/editor/editor.worker.js', import.meta.url).pathname
            default:
                throw new Error(`Unknown label ${label}`);
        }
    }
};

export default monaco
