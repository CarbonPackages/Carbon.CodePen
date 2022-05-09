import React from "react";
import { neos, NeosifiedProps } from "@neos-project/neos-ui-decorators";
import { Button, Icon } from "@neos-project/react-ui-components";
import { connect, ConnectedProps } from "react-redux";
import { selectors } from "@neos-project/neos-ui-redux-store";
import { EditorProps } from "@neos-project/neos-ts-interfaces";
import I18n from "@neos-project/neos-ui-i18n";
import { PackageFrontendConfiguration } from "../manifest";
import { fetchWithErrorHandling } from "@neos-project/neos-ui-backend-connector";
import {
    BootOptionsCodePenJsApi,
    CodePenEditorOptions,
    ContentChangeListener,
} from "./types";
import { afxMappedLanguageId } from "../afxMappedLanguageId";
import debounce from "lodash.debounce";
import { MonacoTailwindcss } from "monaco-tailwindcss";

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
    private previewContentChangeListener?: ContentChangeListener;
    private monacoTailwindCss?: MonacoTailwindcss;

    public warnUserForPossibleNotSavedChanges(e: Event) {
        const confirmationMessage = `Es könnte sein dass die letzten änderungen im CodePen noch nicht gespeichert sind.`;
        // @ts-expect-error
        (e || window.event).returnValue = confirmationMessage;
        return confirmationMessage;
    }

    public componentDidMount() {
        window.addEventListener(
            "beforeunload",
            this.warnUserForPossibleNotSavedChanges
        );
    }

    public componentWillUnmount() {
        window.removeEventListener(
            "beforeunload",
            this.warnUserForPossibleNotSavedChanges
        );
    }

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
        const { monaco, monacoTailwindCss } = initializeMonacoOnceFromConfig(
            packageFrontendConfiguration
        );
        this.monacoTailwindCss = monacoTailwindCss;

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

                    this.previewContentChangeListener?.({
                        tabValues: this.getValuesFromAllTabs(),
                        tabId: id,
                    });
                },
                id,
                label: label ?? `${language} [${id}]`,
                language:
                    language === "afx"
                        ? afxMappedLanguageId
                        : language ?? "html",
                icon: icon ?? "file",
                completion,
            })
        );

        renderSecondaryInspector("CARBON_CODEPEN_EDIT", () => (
            <CodeEditorWrap
                monaco={monaco}
                setUpIframePreview={this.setUpIframePreview.bind(this)}
                node={node!}
                property={identifier}
                tabs={transformedInteractiveTabs}
                onSave={onEnterKey}
                onToggleEditor={this.handleToggleCodeEditor}
            />
        ));
    };

    public setUpIframePreview(e: React.SyntheticEvent<HTMLIFrameElement>) {
        // we use the iframe window as api. If `initializeCarbonCodpen` was registered we will use it.
        const iframeWindow = e.currentTarget.contentWindow!;
        const iframeDocument = iframeWindow.document;

        const codePenContext: BootOptionsCodePenJsApi = {
            onContentDidChange: (listener, debounceTimeout) => {
                this.previewContentChangeListener = debounce(
                    listener,
                    debounceTimeout
                );
            },
            renderComponentOutOfBand: () => this.renderComponentOutOfBand(),
            library: {
                generateStylesFromContent:
                    this.monacoTailwindCss?.generateStylesFromContent,
            },
        };

        // @ts-expect-error
        if (iframeWindow.initializeCarbonCodpen) {
            // Custom behaviour:
            // - can be injected via fusion
            // @ts-expect-error
            iframeWindow.initializeCarbonCodpen(codePenContext);
        } else {
            // Default behaviour:
            // - inject tailwindstyles generated from all content tabs,
            // - render component server side
            codePenContext.onContentDidChange(async ({ tabValues }) => {
                codePenContext.renderComponentOutOfBand().then((content) => {
                    iframeDocument.body.innerHTML = content;
                });

                codePenContext.library
                    .generateStylesFromContent?.(
                        `@tailwind base;
                        @tailwind components;
                        @tailwind utilities;`,
                        Object.values(tabValues)
                    )
                    .then((css) => {
                        const style =
                            iframeDocument.getElementById("_codePenTwStyle");
                        const newStyle = iframeDocument.createElement("style");
                        newStyle.id = "_codePenTwStyle";
                        newStyle.innerHTML = css;
                        if (!style) {
                            iframeDocument.head.append(newStyle);
                            return;
                        }
                        style.parentNode!.replaceChild(newStyle, style!);
                    });
            });
        }

        // trigger initial run
        this.previewContentChangeListener?.({
            tabValues: this.getValuesFromAllTabs(),
            tabId: Object.keys(this.props.options.tabs!)[0],
        });
    }

    public getValuesFromAllTabs() {
        return this.props.value ?? {};
    }

    private async renderComponentOutOfBand() {
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
