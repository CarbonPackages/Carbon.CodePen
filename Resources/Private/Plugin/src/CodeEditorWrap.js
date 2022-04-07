import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { getEditorConfigForLanguage } from "./editorConfig";

let activeModelsByContextPathAndProperty = {};

export default class CodeEditorWrap extends PureComponent {
    static propTypes = {
        onChange: PropTypes.func.isRequired,
        onToggleEditor: PropTypes.func.isRequired,
        onSave: PropTypes.func.isRequired,
        value: PropTypes.string,
        language: PropTypes.string,
        id: PropTypes.string.isRequired,
    };

    monacoContainer;

    disposables = [];

    async componentDidMount() {
        if (!this.monacoContainer) {
            return;
        }

        const { initializeMonaco } = await import('./initializeMonaco');
        const monaco = initializeMonaco();

        let model;
        if (model = activeModelsByContextPathAndProperty[this.props.id]) {
            if (this.props.value !== model.getValue()) {
                model.pushEditOperations([], [{
                    range: model.getFullModelRange(),
                    text: this.props.value,
                }]);
            }
        } else {
            model = monaco.editor.createModel(this.props.value, this.props.language);
            activeModelsByContextPathAndProperty[this.props.id] = model;
        }

        const editor = monaco.editor.create(this.monacoContainer, {
            theme: 'vs-dark',
            model: model,
            automaticLayout: true,
            ...getEditorConfigForLanguage(this.props.language)
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

        editor.addCommand(monaco.KeyCode.Escape, () => {
            this.props.onToggleEditor()
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

        this.disposables = [
            ...this.disposables,
            editor,
            editor.onDidChangeModelContent(() => {
                this.props.onChange(editor.getValue())
            })
        ]
    }

    componentWillUnmount() {
        this.disposables.forEach(dispose => dispose.dispose())
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
