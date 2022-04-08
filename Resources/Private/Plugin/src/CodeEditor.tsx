import React, {PureComponent} from 'react';
import {neos} from '@neos-project/neos-ui-decorators';
import PropTypes from 'prop-types';
import {Button, Icon, Label} from '@neos-project/react-ui-components/';
import {$transform} from "plow-js";
import {connect} from 'react-redux';
import {selectors} from '@neos-project/neos-ui-redux-store';

@neos(globalRegistry => ({
    secondaryEditorsRegistry: globalRegistry.get('inspector').get('secondaryEditors')
}))
@connect($transform({
    node: selectors.CR.Nodes.focusedSelector
}))
export default class CodeEditor extends PureComponent {

    static propTypes = {
        node: PropTypes.object.isRequired,
        identifier: PropTypes.string.isRequired,
        renderSecondaryInspector: PropTypes.func.isRequired,
        commit: PropTypes.func.isRequired,
        onEnterKey: PropTypes.func.isRequired,
        value: PropTypes.string,
        secondaryEditorsRegistry: PropTypes.object.isRequired,
        options: PropTypes.object,
    };

    handleToggleCodeEditor = () => {
        const {secondaryEditorsRegistry, renderSecondaryInspector} = this.props;
        const {component: CodeEditorWrap} = secondaryEditorsRegistry.get('Carbon.CodeEditor/CodeEditorWrap');

        renderSecondaryInspector('CARBON_CODEEDITOR_EDIT', () =>
            <CodeEditorWrap
                id={this.props.node.contextPath + this.props.identifier}
                value={this.props.value}
                onChange={value => this.props.commit(value)}
                onSave={ this.props.onEnterKey}
                onToggleEditor={this.handleToggleCodeEditor}
                language={this.props.options.language}
            />
        );
    }

    render() {
        return (
            <div>
                <Label>
                    <Button  onClick={this.handleToggleCodeEditor}>
                        <Icon icon="pencil" padded="right" title="Edit"/>
                        edit code
                    </Button>
                </Label>
            </div>
        );
    }
}
