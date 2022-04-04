import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {neos} from '@neos-project/neos-ui-decorators';
import * as monaco from 'monaco-editor';
import { configureMonacoTailwindcss } from 'monaco-tailwindcss';
import { emmetHTML as monacoEmmetHTML } from 'emmet-monaco-es'

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

@neos(globalRegistry => {
    const config = globalRegistry.get('frontendConfiguration').get('Carbon.CodeEditor')
    return {
        monacoEditorInclude: config.MonacoEditorInclude,
        clientTailwindConfig: config.clientTailwindConfig,
    }
})
export default class CodeEditorWrap extends PureComponent {
    static propTypes = {
        onChange: PropTypes.func.isRequired,
        onSave: PropTypes.func.isRequired,
        value: PropTypes.string,
        language: PropTypes.string,
        monacoEditorInclude: PropTypes.string.isRequired,
        clientTailwindConfig: PropTypes.string,
    };

    async componentDidMount() {
        if (!this.monacoContainer) {
            return;
        }

        let monacoTailwindcssOptions = {
            languageSelector: ['javascript', 'html'],
            config: {}
        }

        if (this.props.clientTailwindConfig) {
            console.log(JSON.parse(this.props.clientTailwindConfig))
            monacoTailwindcssOptions = {...monacoTailwindcssOptions, config: JSON.parse(this.props.clientTailwindConfig)}
        }

        // todo move this into package init or make sure only called once.
        configureMonacoTailwindcss(monacoTailwindcssOptions)

        const dispose = monacoEmmetHTML(
            monaco,
            ['html', 'php'],
        )

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

        const editor = monaco.editor.create(this.monacoContainer, {
            value: this.props.value,
            language: this.props.language,
            roundedSelection: false,
            scrollBeyondLastLine: false,
            readOnly: false,
            theme: 'vs-dark'
        });

        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.NumpadAdd, () => {
            editor.trigger('keyboard', 'editor.action.fontZoomIn', {})
        });

        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.NumpadSubtract, () => {
            editor.trigger('keyboard', 'editor.action.fontZoomOut', {})
        });

        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Numpad0, () => {
            editor.trigger('keyboard', 'editor.action.fontZoomReset', {})
        });

        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
            this.props.onSave()
        });

        editor.addAction({
            id: 'carbon.fullscreen',
            label: 'Fullscreen',
            keybindings: [
                monaco.KeyCode.F11,
            ],
            contextMenuGroupId: 'navigation',
            contextMenuOrder: 1.5,
            run: () => {
                this.monacoContainer.requestFullscreen()
            }
        });

        const resizeEditor = () => editor.layout()

        this.monacoContainer.addEventListener('fullscreenchange', resizeEditor);
        window.addEventListener('resize', resizeEditor)

        editor.onDidChangeModelContent(() => {
            this.props.onChange(editor.getValue())
        })
    }

    render() {
        return (
            <div
                style={{height: "100%", width: "100%"}}
                ref={self => this.monacoContainer = self}>
            </div>
        )
    }
}
