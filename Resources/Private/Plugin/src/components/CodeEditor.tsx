import React from "react";
import { neos, NeosifiedProps } from "@neos-project/neos-ui-decorators";
import { Button, Icon } from "@neos-project/react-ui-components";
import { connect, ConnectedProps } from "react-redux";
import { selectors } from "@neos-project/neos-ui-redux-store";
import { EditorProps } from "@neos-project/neos-ts-interfaces";
import I18n from "@neos-project/neos-ui-i18n";
type CodeEditorWrapType = typeof import("./CodeEditorWrap").default;

const neosifier = neos((globalRegistry) => ({
    secondaryEditorsRegistry: globalRegistry
        .get("inspector")
        .get("secondaryEditors"),
}));

const connector = connect((state) => ({
    node: selectors.CR.Nodes.focusedSelector(state),
}));

type NeosProps = NeosifiedProps<typeof neosifier>;

type StateProps = ConnectedProps<typeof connector>;

type Props = EditorProps<{
    language: string;
}>;

class CodeEditor extends React.Component<Props & StateProps & NeosProps> {
    public handleToggleCodeEditor = (): void => {
        const { secondaryEditorsRegistry, renderSecondaryInspector } =
            this.props;
        const { component: CodeEditorWrap } = secondaryEditorsRegistry.get(
            "Carbon.CodeEditor/CodeEditorWrap"
        ) as { component: CodeEditorWrapType };

        renderSecondaryInspector("CARBON_CODEEDITOR_EDIT", () => (
            <CodeEditorWrap
                id={this.props.node!.contextPath + this.props.identifier}
                value={this.props.value}
                onChange={(value: string) => this.props.commit(value)}
                onSave={this.props.onEnterKey}
                onToggleEditor={this.handleToggleCodeEditor}
                language={this.props.options.language}
            />
        ));
    };

    render() {
        return (
            <div>
                <Button onClick={this.handleToggleCodeEditor}>
                    <Icon icon="pencil" padded="right" title="Edit" />
                    <I18n id={this.props.label} />
                </Button>
            </div>
        );
    }
}

export default neosifier(connector(CodeEditor));
