import React from "react";
import { getEditorConfigForLanguage } from "../editorConfig";
import { IDisposable, editor } from "monaco-editor";
import { Node } from "@neos-project/neos-ts-interfaces";
import debounce from "lodash.debounce";
import { PackageFrontendConfiguration } from "../manifest";
import { Icon } from "@neos-project/react-ui-components";
import { Tab } from "./types";
import { registerCompletionForTab } from "./registerCompletionForTab";
import { registerDocumentationForFusionObjects } from "./registerDocumentationForFusionObjects";

type IdentfierFromNodeAndProperty = string;
type ActiveModels = Record<IdentfierFromNodeAndProperty, editor.ITextModel>;

let activeModelsByIdAndTabId: ActiveModels = {};

interface Props {
    tabs: Tab[];
    node: Node;
    property: string;
    monaco: typeof import("monaco-editor");
    packageFrontendConfiguration: PackageFrontendConfiguration;
    renderPreviewOutOfBand(): Promise<string>;
    onToggleEditor(): void;
    onSave(): void;
}

export default class CodeEditorWrap extends React.PureComponent<Props> {
    private monacoContainer?: HTMLElement;
    private previewIframe?: HTMLIFrameElement;

    disposables: (IDisposable | undefined)[] = [];

    activeTabDispose?: IDisposable;

    editor?: editor.IStandaloneCodeEditor;

    activeTab?: Tab;

    async componentDidMount() {
        if (!this.monacoContainer) {
            return;
        }

        const { monaco, tabs } = this.props;

        const editor = monaco.editor.create(this.monacoContainer, {
            theme: "vs-dark",
            automaticLayout: true,
        });

        this.editor = editor;

        this.setActiveTab(tabs[0]);

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

        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
            this.props.onSave();
        });

        editor.addCommand(monaco.KeyCode.Escape, () => {
            this.props.onToggleEditor();
        });

        editor.addAction({
            id: "carbon.fullscreen",
            label: "Fullscreen",
            keybindings: [monaco.KeyCode.F11],
            contextMenuGroupId: "navigation",
            contextMenuOrder: 1.5,
            run: () => this.monacoContainer!.requestFullscreen(),
        });

        const updateIframe = async () => {
            const contents = await this.props.renderPreviewOutOfBand();
            if (this.previewIframe?.contentDocument) {
                this.previewIframe!.contentDocument!.open();
                this.previewIframe!.contentDocument!.write(contents);
            }
        };

        const updateIframeDebounced = debounce(updateIframe, 500);
        updateIframe();

        this.disposables = [
            ...this.disposables,
            editor,
            editor.onDidChangeModelContent(() => {
                this.activeTab!.setValue(editor.getValue());
                updateIframeDebounced();
            }),
        ];

        const fusionObjectsConfig =
            this.props.packageFrontendConfiguration.afx.fusionObjects;

        this.disposables.push(
            registerDocumentationForFusionObjects(monaco, fusionObjectsConfig)
        );
    }

    componentWillUnmount() {
        this.activeTabDispose?.dispose();
        for (const disposable of this.disposables) {
            disposable?.dispose();
        }
    }

    getCacheIdForTab({ id }: Tab): string {
        const { node, property } = this.props;
        return node.contextPath + property + id;
    }

    createOrRetriveModel(tab: Tab): editor.ITextModel {
        const { language } = tab;
        const value = tab.getValue();

        const cacheIdentifier = this.getCacheIdForTab(tab);
        const cachedModel = activeModelsByIdAndTabId[cacheIdentifier];

        if (cachedModel) {
            if (value !== cachedModel.getValue()) {
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

        const model = this.props.monaco.editor.createModel(
            value ?? "",
            language
        );
        activeModelsByIdAndTabId[cacheIdentifier] = model;
        return model;
    }

    setActiveTab(tab: Tab) {
        this.activeTab = tab;

        this.editor!.setModel(this.createOrRetriveModel(tab));
        this.editor!.updateOptions(getEditorConfigForLanguage(tab.language));

        const { monaco, node } = this.props;
        this.activeTabDispose?.dispose();
        this.activeTabDispose = registerCompletionForTab(monaco, node, tab);
    }

    render() {
        return (
            <div style={{ height: "100%", width: "100%" }}>
                <ul>
                    {this.props.tabs.map((tab) => (
                        <li>
                            <button onClick={() => this.setActiveTab(tab)}>
                                <Icon icon={tab.icon}></Icon>
                                {tab.label}
                            </button>
                        </li>
                    ))}
                </ul>
                <div
                    style={{ height: "50%", width: "100%" }}
                    ref={(el) => (this.monacoContainer = el!)}
                />
                <div style={{ height: "50%", width: "100%" }}>
                    <iframe
                        style={{
                            height: "100%",
                            width: "100%",
                            background: "#fff",
                        }}
                        ref={(el) => (this.previewIframe = el!)}
                    ></iframe>
                </div>
            </div>
        );
    }
}
