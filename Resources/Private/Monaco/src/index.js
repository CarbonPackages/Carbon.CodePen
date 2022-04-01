import * as monaco from 'monaco-editor';
// import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

// Required Js to initiate the workers created above.
window.MonacoEnvironment = {
    getWorkerUrl: (moduleId, label) => {
        switch (label) {
            case 'json':
                return new Worker(new URL('vs/language/json/json.worker.js', import.meta.url))
            case 'css':
            case 'scss':
            case 'less':
                return new Worker(new URL('vs/language/css/css.worker.js', import.meta.url))
            case 'html':
            case 'handlebars':
            case 'razor':
                return new Worker(new URL('vs/language/html/html.worker.js', import.meta.url))
            case 'typescript':
            case 'javascript':
                return new Worker(new URL('vs/language/typescript/ts.worker.js', import.meta.url))
            default:
                return new Worker(new URL('vs/editor/editor.worker.js', import.meta.url))
        }
    }
};

export default monaco
