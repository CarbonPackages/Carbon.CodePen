import React, {PureComponent} from 'react';
import {neos} from '@neos-project/neos-ui-decorators';
import PropTypes from 'prop-types';
import {Button, Icon, Label} from '@neos-project/react-ui-components/';

@neos(globalRegistry => ({
    secondaryEditorsRegistry: globalRegistry.get('inspector').get('secondaryEditors')
}))
export default class CodeEditor extends PureComponent {

    static propTypes = {
        identifier: PropTypes.string.isRequired,
        renderSecondaryInspector: PropTypes.func.isRequired,
        commit: PropTypes.func.isRequired,
        value: PropTypes.string,
        secondaryEditorsRegistry: PropTypes.object.isRequired,
        options: PropTypes.object,
    };

    handleOpenCodeEditor = () => {
        const {secondaryEditorsRegistry, renderSecondaryInspector} = this.props;
        const {component: CodeEditorWrap} = secondaryEditorsRegistry.get('Carbon.CodeEditor/CodeEditorWrap');

        renderSecondaryInspector('CARBON_CODEEDITOR_EDIT', () =>
            <CodeEditorWrap
                value={this.props.value}
                onChange={value => this.props.commit(value)}
                language={this.props.options.language}
            />
        );
    }

    render() {
        return (
            <div>
                <Label>
                    <Button onClick={this.handleOpenCodeEditor}>
                        <Icon icon="pencil" padded="right" title="Edit"/>
                        edit code
                    </Button>
                </Label>
            </div>
        );
    }
}
