import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {neos} from '@neos-project/neos-ui-decorators';
import { emmetHTML as monacoEmmetHTML } from 'emmet-monaco-es'

@neos(globalRegistry => {
    const config = globalRegistry.get('frontendConfiguration').get('Carbon.CodeEditor')
    return {
        monacoEditorInclude: config.MonacoEditorInclude,
    }
})
export default class CodeEditorWrap extends PureComponent {
    static propTypes = {
        onChange: PropTypes.func.isRequired,
        value: PropTypes.string,
        language: PropTypes.string,
        monacoEditorInclude: PropTypes.string.isRequired,
    };

    async componentDidMount() {
        if (!this.monacoContainer) {
            return;
        }

        const {default: monaco} = await import(/* webpackIgnore: true */this.props.monacoEditorInclude)

        const dispose = monacoEmmetHTML(
            monaco,
            ['html', 'php'],
        )

        const afxSnippets = {
            'Neos.Fusion:Loop': `<Neos.Fusion:Loop items={}></Neos.Fusion:Loop>`,
            'Neos.Fusion:Value': `<Neos.Fusion:Value value={}/>`,
            'Neos.Fusion:Join': `<Neos.Fusion:Join></Neos.Fusion:Join>`,
            'Neos.Fusion:Tag': `<Neos.Fusion:Tag tagName="" attributes.class=""></Neos.Fusion:Tag>`,
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
