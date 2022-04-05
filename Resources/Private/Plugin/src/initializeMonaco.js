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

    const afxSnippets = {
        'Neos.Fusion:Loop': '<Neos.Fusion:Loop items={${1:items}}>\n\t$0\n</Neos.Fusion:Loop>',
        'Neos.Fusion:Value': '<Neos.Fusion:Value value={${1:value}}/>',
        'Neos.Fusion:Join': '<Neos.Fusion:Join>\n\t$0\n</Neos.Fusion:Join>',
        'Neos.Fusion:Tag': '<Neos.Fusion:Tag tagName="${1:h1}" attributes.class="${2:fancy}">\n\t$0\n</Neos.Fusion:Tag>',
    }

    monaco.languages.registerCompletionItemProvider('html', {
        provideCompletionItems: (model, position) => {
            const word = model.getWordUntilPosition(position);

            const prevChar = model.getValueInRange({
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: word.startColumn - 1,
                endColumn: word.startColumn
            });

            const prepareSnippet = snippet => {
                if (prevChar === '<' && snippet[0] === '<') {
                    // if the char before the word was a `<`
                    // we will not need it anymore from the snippet
                    return snippet.slice(1)
                }
                return snippet;
            }

            const range = {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: word.startColumn,
                endColumn: word.endColumn
            };

            return {
                suggestions: Object.entries(afxSnippets).map(([label, snippet]) => ({
                    label,
                    range,
                    insertText: prepareSnippet(snippet),
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    kind: monaco.languages.CompletionItemKind.Snippet,
                }))
            };
        }
    });

    initialized = true;
    return monaco;
}
