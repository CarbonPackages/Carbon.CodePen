import React from "react";
import { neos, NeosifiedProps } from "@neos-project/neos-ui-decorators";
import { Button, Icon } from "@neos-project/react-ui-components";
import { connect, ConnectedProps } from "react-redux";
import { selectors } from "@neos-project/neos-ui-redux-store";
import { EditorProps } from "@neos-project/neos-ts-interfaces";
import I18n from "@neos-project/neos-ui-i18n";
import { PackageFrontendConfiguration } from "../manifest";

const objectIsEmpty = (obj: object) => {
    for (var _key in obj) {
        return false;
    }
    return true;
};

const neosifier = neos((globalRegistry) => ({
    secondaryEditorsRegistry: globalRegistry
        .get("inspector")
        .get("secondaryEditors"),
    packageFrontendConfiguration: globalRegistry
        .get("frontendConfiguration")
        .get("Carbon.CodePen") as PackageFrontendConfiguration,
}));

const connector = connect((state) => ({
    node: selectors.CR.Nodes.focusedSelector(state),
}));

type NeosProps = NeosifiedProps<typeof neosifier>;

type StateProps = ConnectedProps<typeof connector>;

type Props = EditorProps<
    {
        tabs: {
            [id: string]: {
                label: string;
                language: string;
            };
        };
        disabled: boolean;
    },
    Record<string, string>
>;

class CodeEditor extends React.Component<Props & StateProps & NeosProps> {
    private currentValue: Record<string, string> = {};

    constructor(props: any) {
        super(props);
        this.currentValue = this.props.value ?? {};
    }

    public handleToggleCodeEditor = async () => {
        const {
            packageFrontendConfiguration,
            secondaryEditorsRegistry,
            renderSecondaryInspector,
            onEnterKey,
            node,
            identifier,
            value,
            options: { tabs },
        } = this.props;

        const CodeEditorWrap = secondaryEditorsRegistry.get(
            "Carbon.CodePen/CodeEditorWrap"
        )!.component as typeof import("./CodeEditorWrap").default;

        const { initializeMonacoOnceFromConfig } = await import(
            "../initializeMonaco"
        );
        const monaco = initializeMonacoOnceFromConfig(
            packageFrontendConfiguration
        );

        const tabsCombined = Object.entries(tabs).map(
            ([id, { label, language }]) => ({
                value: value![id],
                id,
                label,
                language,
            })
        );

        renderSecondaryInspector("CARBON_CODEPEN_EDIT", () => (
            <CodeEditorWrap
                getCurrentValue={() => this.currentValue}
                monaco={monaco}
                node={node!}
                property={identifier}
                tabs={tabsCombined}
                onChange={this.handleChange}
                onSave={onEnterKey}
                onToggleEditor={this.handleToggleCodeEditor}
            />
        ));
    };

    /**
     * Notifies the Neos UI that a tab content changed.
     * commit expects the final array value of the combined tabs,
     * so we instert the new change into the known values.
     *
     */
    handleChange = (tabId: string, tabValue: string) => {
        if (tabValue === "") {
            delete this.currentValue[tabId];
        } else {
            // normal assign doenst work: `this.currentValue[tabId] = tabValue`
            this.currentValue = {
                ...this.currentValue,
                [tabId]: tabValue,
            };
        }
        if (objectIsEmpty(this.currentValue)) {
            this.currentValue = {};
            // nope its not commit(null); to reset, but will be treated as null.
            this.props.commit("");
            return;
        }
        this.props.commit(this.currentValue);
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
