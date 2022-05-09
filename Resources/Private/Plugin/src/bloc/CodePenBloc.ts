import { Node } from "@neos-project/neos-ts-interfaces";
import { fetchWithErrorHandling } from "@neos-project/neos-ui-backend-connector";
import debounce from "lodash.debounce";
import { editor, IDisposable } from "monaco-editor";
import { MonacoTailwindcss } from "monaco-tailwindcss";
import { getEditorConfigForLanguage } from "../services/editorConfig";
import { Bloc } from "./Bloc";
import { registerCompletionForTab } from "../services/registerCompletionForTab";
import { BootOptionsCodePenJsApi, ContentChangeListener, Tab } from "../types";

export type CodePenState = {
    tabs: Tab[];
    activeTab?: Tab;
    previewModeColumn: boolean;
};

const initalState: CodePenState = {
    tabs: [],
    activeTab: undefined,
    previewModeColumn: false,
};

type PropertyValue = Record<string, string>;

type NeosUiEditorApi = {
    node: Node;
    nodeTabProperty: string;
    tabValues: TabValues;
    tabs: Tab[];

    toggleCodePenWindow(): void;

    applyTabValues(): void;
    commitTabValues(propertyValue: PropertyValue): void;
    resetTabValues(): void;
};

const objectIsEmpty = (obj: object) => {
    for (var _key in obj) {
        return false;
    }
    return true;
};

/**
 * @Flow\Scope("singleton")
 */
export class CodePenBloc extends Bloc<CodePenState> {
    private codePenWindowDisposables: (IDisposable | undefined)[] = [];
    private activeTabDisposables: (IDisposable | undefined)[] = [];

    private monacoEditor?: editor.IStandaloneCodeEditor;

    private monaco: typeof import("monaco-editor");
    private monacoTailwindCss?: MonacoTailwindcss;

    private activeCachedModels: Record<string, editor.ITextModel> = {};

    private neosUiEditorApi?: NeosUiEditorApi;

    private previewContentChangeListener?: ContentChangeListener;

    constructor(
        monaco: typeof import("monaco-editor"),
        monacoTailwindCss?: MonacoTailwindcss
    ) {
        super(initalState);
        this.monaco = monaco;
        this.monacoTailwindCss = monacoTailwindCss;
    }

    public connectToNeosUiEditor(neosUiEditorApi: NeosUiEditorApi) {
        this.neosUiEditorApi = neosUiEditorApi;
        this.publishState({
            ...this.state,
            activeTab: neosUiEditorApi.tabs[0],
            tabs: neosUiEditorApi.tabs,
        });
    }

    public detatchNeosUiEditor() {
        this.neosUiEditorApi = undefined;
        // just in case...
        this.windowClosed();
    }

    public updateNeosUiEditorTabValues(tabValues: TabValues) {
        this.neosUiEditorApi!.tabValues = tabValues;
    }

    private getCacheIdForTab({ id }: Tab): string {
        const { node, nodeTabProperty } = this.neosUiEditorApi!;
        return node.contextPath + nodeTabProperty + id;
    }

    private createOrRetriveModel(tab: Tab): editor.ITextModel {
        const { language } = tab;
        const value = this.neosUiEditorApi!.tabValues[tab.id];

        const cacheIdentifier = this.getCacheIdForTab(tab);
        const cachedModel = this.activeCachedModels[cacheIdentifier];

        if (cachedModel) {
            if (cachedModel.getValue() !== value) {
                cachedModel.pushEditOperations(
                    [],
                    [
                        {
                            range: cachedModel.getFullModelRange(),
                            text: value ?? null,
                        },
                    ],
                    () => null
                );
            }
            return cachedModel;
        }

        const model = this.monaco.editor.createModel(value ?? "", language);
        this.activeCachedModels[cacheIdentifier] = model;
        return model;
    }

    private monacoChangeEditorToTab(tab: Tab) {
        const editor = this.monacoEditor!;
        const monaco = this.monaco;
        const node = this.neosUiEditorApi!.node;

        editor.setModel(this.createOrRetriveModel(tab));
        editor.updateOptions(getEditorConfigForLanguage(tab.language));

        for (const disposeable of this.activeTabDisposables) {
            disposeable?.dispose();
        }
        this.activeTabDisposables = [
            registerCompletionForTab(monaco, node, tab),
        ];
    }

    public changeToTab(tab: Tab) {
        this.monacoChangeEditorToTab(tab);
        this.publishState({ ...this.state, activeTab: tab });
    }

    public togglePreview() {
        this.publishState({
            ...this.state,
            previewModeColumn: !this.state.previewModeColumn,
        });
    }

    public setUpIframePreview(iframe: HTMLIFrameElement) {
        // we use the iframe window as api. If `initializeCarbonCodpen` was registered we will use it.
        const iframeWindow = iframe.contentWindow!;
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
        this.previewContentChangeListener!({
            tabValues: this.neosUiEditorApi!.tabValues,
            tabId: this.state.activeTab!.id,
        });
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
                    node: this.neosUiEditorApi!.node!.contextPath,
                    propertyName: this.neosUiEditorApi!.nodeTabProperty,
                    propertyValue: JSON.stringify(
                        this.neosUiEditorApi!.tabValues
                    ),
                }),
            }))
            .catch((reason) =>
                fetchWithErrorHandling.generalErrorHandler(reason)
            );
        return result.text();
    }

    public initializeMonaco(
        monacoContainer: HTMLElement,
        codePenContainer: HTMLElement
    ) {
        const monaco = this.monaco;

        const editor = (this.monacoEditor = monaco.editor.create(
            monacoContainer,
            {
                theme: "vs-dark",
                automaticLayout: true,
            }
        ));

        this.monacoChangeEditorToTab(this.state.activeTab!);

        editor.addCommand(
            monaco.KeyMod.CtrlCmd | monaco.KeyCode.NumpadAdd,
            () => editor.trigger("keyboard", "editor.action.fontZoomIn", {})
        );

        editor.addCommand(
            monaco.KeyMod.CtrlCmd | monaco.KeyCode.NumpadSubtract,
            () => editor.trigger("keyboard", "editor.action.fontZoomOut", {})
        );

        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Numpad0, () =>
            editor.trigger("keyboard", "editor.action.fontZoomReset", {})
        );

        editor.addCommand(
            monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
            this.neosUiEditorApi!.applyTabValues
        );

        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyQ, () =>
            this.toggleWindow()
        );

        editor.addAction({
            id: "carbon.fullscreen",
            label: "Fullscreen",
            keybindings: [monaco.KeyCode.F11],
            contextMenuGroupId: "navigation",
            contextMenuOrder: 1.5,
            run: () => codePenContainer!.requestFullscreen(),
        });

        this.codePenWindowDisposables = [
            ...this.codePenWindowDisposables,
            editor,
            editor.onDidChangeModelContent(() => {
                const newTabValue = editor.getValue();
                const activeTab = this.state.activeTab!;
                this.changeValueOfTab(activeTab, newTabValue);
                this.previewContentChangeListener?.({
                    tabId: activeTab.id,
                    tabValues: this.neosUiEditorApi!.tabValues,
                });
            }),
            this.fixNeosSecondEditorPortalHangingToLow(monacoContainer),
        ];
    }

    /**
     * Currently the secondary editor is rendered via a React Portal and absolutely positioned with css
     * see image https://github.com/neos/neos-ui/issues/3095#issuecomment-1085740348
     * but the css `top` property is with `82px` px to high and we would cut off content of the bottom from the editor
     * so we hackily set the top property to `41px` for this editor.
     */
    private fixNeosSecondEditorPortalHangingToLow(
        monacoContainer: HTMLElement
    ): IDisposable | undefined {
        const secondaryEditorFrame = document.querySelector(
            "[class*=secondaryInspector]"
        ) as HTMLElement | null;

        if (!secondaryEditorFrame?.contains(monacoContainer)) {
            return;
        }

        secondaryEditorFrame.style.top = "41px";

        return {
            dispose() {
                secondaryEditorFrame.style.top = "";
            },
        };
    }

    /**
     * Notifies the Neos UI that a tab content changed.
     * commit expects the final array value of the combined tabs,
     * so we instert the new change into the known values.
     *
     * The `value` prop will be refreshed automatically by the ui.
     * Eg the component will update.
     */
    private changeValueOfTab({ id }: Tab, newTabValue: string) {
        // spread makes some kind of better copy
        // other wise removing a tabs content wont be commited.
        let newValue = { ...this.neosUiEditorApi!.tabValues };
        if (newTabValue === "") {
            delete newValue[id];
        } else {
            newValue[id] = newTabValue;
        }
        if (objectIsEmpty(newValue)) {
            this.neosUiEditorApi!.resetTabValues();
            return;
        }
        this.neosUiEditorApi!.commitTabValues(newValue);
    }

    public toggleWindow() {
        this.neosUiEditorApi!.toggleCodePenWindow();
    }

    public windowClosed() {
        for (const disposeable of this.codePenWindowDisposables) {
            disposeable?.dispose();
        }
        this.codePenWindowDisposables = [];
    }
}
