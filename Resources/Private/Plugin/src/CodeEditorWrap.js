import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {neos} from '@neos-project/neos-ui-decorators';
import loadMonaco from './loadMonaco';

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

        const monaco = await loadMonaco(this.props.monacoEditorInclude);

        const editor = monaco.editor.create(this.monacoContainer, {
            value: this.props.value,
            language: this.props.language,
            roundedSelection: false,
            scrollBeyondLastLine: false,
            readOnly: false,
            theme: 'vs-dark'
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
