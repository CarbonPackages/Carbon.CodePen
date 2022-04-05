import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

let activeModelsByContextPathAndProperty = {};

export default class CodeEditorWrap extends PureComponent {
    static propTypes = {
        onChange: PropTypes.func.isRequired,
        onSave: PropTypes.func.isRequired,
        value: PropTypes.string,
        language: PropTypes.string,
        id: PropTypes.string.isRequired,
    };

    editor;

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

        const editor = this.editor = monaco.editor.create(this.monacoContainer, {
            roundedSelection: false,
            scrollBeyondLastLine: false,
            readOnly: false,
            theme: 'vs-dark',
            model: model,
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

        this.disposables.push(() => this.monacoContainer.removeEventListener('fullscreenchange', resizeEditor))
        this.disposables.push(() => window.removeEventListener('resize', resizeEditor))

        const onDidChangeModelContentDisposable = editor.onDidChangeModelContent(() => {
            this.props.onChange(editor.getValue())
        })
        this.disposables.push(() => onDidChangeModelContentDisposable.dispose())
    }

    componentWillUnmount() {
        this.editor.dispose()
        // const model = this.editor.getModel()
        // if (model) {
        //     model.dispose()
        // }
        this.disposables.map(dispose => dispose())
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
