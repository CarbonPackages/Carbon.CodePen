import React from "react";
import { neos, NeosInjectedProps } from "@neos-project/neos-ui-decorators";
import { Button, Icon, Label } from "@neos-project/react-ui-components";
import { connect, ConnectedProps, DefaultRootState } from "react-redux";
import { selectors } from "@neos-project/neos-ui-redux-store";
import { EditorProps } from "@neos-project/neos-ui-editors";
import { GlobalRegistry, Node } from "@neos-project/neos-ts-interfaces";

type NeosProps = NeosInjectedProps<typeof mapRegistryToProps>;

type StateProps = ConnectedProps<typeof connector>;

type OwnProps = EditorProps<{
    language: string;
}>;

class CodeEditor extends React.Component<OwnProps & NeosProps & StateProps> {
    public handleToggleCodeEditor = (): void => {
        const { secondaryEditorsRegistry, renderSecondaryInspector } =
            this.props;
        const { component: CodeEditorWrap } = secondaryEditorsRegistry.get(
            "Carbon.CodeEditor/CodeEditorWrap"
        )!;

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
                <Label>
                    <Button onClick={this.handleToggleCodeEditor}>
                        <Icon icon="pencil" padded="right" title="Edit" />
                        edit code
                    </Button>
                </Label>
            </div>
        );
    }
}

const mapRegistryToProps = (globalRegistry: GlobalRegistry) => ({
    secondaryEditorsRegistry: globalRegistry
        .get("inspector")
        .get("secondaryEditors"),
});

const mapStateToProps = (state: DefaultRootState) => ({
    node: selectors.CR.Nodes.focusedSelector(state),
});

const WrappedNeos = neos<OwnProps & StateProps, NeosProps>(mapRegistryToProps)(
    CodeEditor
);

const connector = connect(mapStateToProps);

const WrappedState = connector(WrappedNeos);

export default WrappedState;
