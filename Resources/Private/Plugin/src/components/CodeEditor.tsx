import React from "react";
import { neos, NeosifiedProps } from "@neos-project/neos-ui-decorators";
import { Button, Icon } from "@neos-project/react-ui-components";
import { connect, ConnectedProps } from "react-redux";
import { selectors } from "@neos-project/neos-ui-redux-store";
import { EditorProps } from "@neos-project/neos-ts-interfaces";
import I18n from "@neos-project/neos-ui-i18n";
import { PackageFrontendConfiguration } from "../manifest";

const neosifier = neos((globalRegistry) => ({
    secondaryEditorsRegistry: globalRegistry
        .get("inspector")
        .get("secondaryEditors"),
    packageFrontendConfiguration: globalRegistry
        .get("frontendConfiguration")
        .get("Carbon.CodeEditor") as PackageFrontendConfiguration,
}));

const connector = connect((state) => ({
    node: selectors.CR.Nodes.focusedSelector(state),
}));

type NeosProps = NeosifiedProps<typeof neosifier>;

type StateProps = ConnectedProps<typeof connector>;

type Props = EditorProps<{
    language: string;
    disabled: boolean;
}>;

class CodeEditor extends React.Component<Props & StateProps & NeosProps> {
    public handleToggleCodeEditor = async () => {
        const {
            packageFrontendConfiguration,
            secondaryEditorsRegistry,
            renderSecondaryInspector,
            onEnterKey,
            node,
            identifier,
            value,
            options: { language },
        } = this.props;

        const CodeEditorWrap = secondaryEditorsRegistry.get(
            "Carbon.CodeEditor/CodeEditorWrap"
        )!.component as typeof import("./CodeEditorWrap").default;

        const { initializeMonacoOnceFromConfig } = await import(
            "../initializeMonaco"
        );
        const monaco = initializeMonacoOnceFromConfig(
            packageFrontendConfiguration
        );

        renderSecondaryInspector("CARBON_CODEEDITOR_EDIT", () => (
            <CodeEditorWrap
                monaco={monaco}
                id={node!.contextPath + identifier}
                value={value}
                onChange={this.handleChange}
                onSave={onEnterKey}
                onToggleEditor={this.handleToggleCodeEditor}
                language={language}
            />
        ));
    };

    handleChange = (value: string) => {
        this.props.commit(value);
    };

    render() {
        const {
            label,
            options: { disabled },
        } = this.props;

        return (
            <div>
                <Button
                    onClick={this.handleToggleCodeEditor}
                    disabled={disabled}
                >
                    <Icon icon="pencil" padded="right" title="Edit" />
                    <I18n id={label} />
                </Button>
            </div>
        );
    }
}

export default neosifier(connector(CodeEditor));
