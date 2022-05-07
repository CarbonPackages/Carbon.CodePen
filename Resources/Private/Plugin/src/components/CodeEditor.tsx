import React from "react";
import { neos, NeosifiedProps } from "@neos-project/neos-ui-decorators";
import { Button, Icon } from "@neos-project/react-ui-components";
import { connect, ConnectedProps } from "react-redux";
import { selectors } from "@neos-project/neos-ui-redux-store";
import { EditorProps } from "@neos-project/neos-ts-interfaces";
import I18n from "@neos-project/neos-ui-i18n";
import { PackageFrontendConfiguration } from "../manifest";
import { fetchWithErrorHandling } from "@neos-project/neos-ui-backend-connector";
import { CodePenEditorOptions } from "./types";

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

type Props = EditorProps<CodePenEditorOptions, Record<string, string>>;

class CodeEditor extends React.PureComponent<Props & StateProps & NeosProps> {
    public handleToggleCodeEditor = async () => {
        const {
            packageFrontendConfiguration,
            secondaryEditorsRegistry,
            renderSecondaryInspector,
            onEnterKey,
            node,
            identifier,
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

        if (!tabs) {
            console.error(
                `Carbon.CodePen cannot be initialized, because no tabs were defined in editiorOptions.`
            );
            return;
        }

        const transformedInteractiveTabs = Object.entries(tabs).map(
            ([id, { label, language, completion, icon }]) => ({
                getValue: (): string | undefined => {
                    return this.getValuesFromAllTabs()[id];
                },
                setValue: (newValue: string) => {
                    this.updateTabValue(id, newValue);
                },
                id,
                label: label ?? `${language} [${id}]`,
                language: language ?? "html",
                icon: icon ?? "file",
                completion,
            })
        );

        renderSecondaryInspector("CARBON_CODEPEN_EDIT", () => (
            <CodeEditorWrap
                renderPreviewOutOfBand={() => this.renderPreviewOutOfBand()}
                packageFrontendConfiguration={packageFrontendConfiguration}
                monaco={monaco}
                node={node!}
                property={identifier}
                tabs={transformedInteractiveTabs}
                onSave={onEnterKey}
                onToggleEditor={this.handleToggleCodeEditor}
            />
        ));
    };

    public getValuesFromAllTabs() {
        return this.props.value ?? {};
    }

    public async renderPreviewOutOfBand() {
        const result = await fetchWithErrorHandling
            .withCsrfToken((csrfToken) => ({
                url: "/neos/codePen/render/",
                method: "POST",
                credentials: "include",
                headers: {
                    "X-Flow-Csrftoken": csrfToken,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    node: this.props.node!.contextPath,
                    propertyName: this.props.identifier,
                    propertyValue: JSON.stringify(this.getValuesFromAllTabs()),
                }),
            }))
            .catch((reason) =>
                fetchWithErrorHandling.generalErrorHandler(reason)
            );
        return result.text();
    }

    /**
     * Notifies the Neos UI that a tab content changed.
     * commit expects the final array value of the combined tabs,
     * so we instert the new change into the known values.
     *
     * The `value` prop will be refreshed automatically by the ui.
     * Eg the component will update.
     */
    private updateTabValue = (tabId: string, tabValue: string) => {
        // spread makes some kind of better copy
        // other wise removing a tabs content wont be commited.
        let newValue = { ...this.props.value };
        if (tabValue === "") {
            delete newValue[tabId];
        } else {
            newValue[tabId] = tabValue;
        }
        if (objectIsEmpty(newValue)) {
            // nope its not commit(null); to reset, but will be treated as null.
            this.props.commit("");
            return;
        }
        this.props.commit(newValue);
    };

    public render() {
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
