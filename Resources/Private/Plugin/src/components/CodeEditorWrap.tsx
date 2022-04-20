import React from "react";
import { getEditorConfigForLanguage } from "../editorConfig";
import { IDisposable, editor } from "monaco-editor";
import { Node } from "@neos-project/neos-ts-interfaces";
import once from "lodash.once";
import debounce from "lodash.debounce";

type IdentfierFromNodeAndProperty = string;
type ActiveModels = Record<IdentfierFromNodeAndProperty, editor.ITextModel>;

let activeModelsByIdAndTabId: ActiveModels = {};

interface Completion {
    (node: Node): Promise<string>[];
}

type Tab = Readonly<{
    value: string;
    id: string;
    label: string;
    language: string;
    completion?: Completion;
}>;

interface Props {
    monaco: typeof import("monaco-editor");
    node: Node;
    property: string;
    getCurrentValue(): Record<string, string>;
    onChange(tabId: string, tabValue: string): void;
    onToggleEditor(): void;
    onSave(): void;
    /**
     * Immutable early state key value pair of tabname and its content
     */
    tabs: Tab[];
}

export default class CodeEditorWrap extends React.PureComponent<Props> {
    private monacoContainer?: HTMLElement;
    private propertyValueField?: HTMLInputElement;
    private propertyFormField?: HTMLFormElement;

    disposables: IDisposable[] = [];

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

        this.propertyValueField!.value = JSON.stringify(
            this.props.getCurrentValue()
        );
        this.propertyFormField!.submit();

        const updateIframe = debounce(() => {
            this.propertyValueField!.value = JSON.stringify(
                this.props.getCurrentValue()
            );
            this.propertyFormField!.submit();
        }, 500);

        this.disposables = [
            ...this.disposables,
            editor,
            editor.onDidChangeModelContent(() => {
                this.props.onChange(this.activeTab!.id, editor.getValue());
                updateIframe();
            }),
        ];
    }

    componentWillUnmount() {
        for (const disposable of this.disposables) {
            disposable.dispose();
        }
    }

    getCacheIdForTab({ id }: Tab): string {
        const { node, property } = this.props;
        return node.contextPath + property + id;
    }

    createOrRetriveModel(tab: Tab): editor.ITextModel {
        const cacheIdentifier = this.getCacheIdForTab(tab);
        const { language, id } = tab;
        const value = this.props.getCurrentValue()[id];
        const cachedModel = activeModelsByIdAndTabId[cacheIdentifier];
        if (cachedModel) {
            if (value && value !== cachedModel.getValue()) {
                cachedModel.pushEditOperations(
                    [],
                    [
                        {
                            range: cachedModel.getFullModelRange(),
                            text: value,
                        },
                    ],
                    () => null
                );
            }
            return cachedModel;
        }

        const model = this.props.monaco.editor.createModel(value, language);
        activeModelsByIdAndTabId[cacheIdentifier] = model;
        return model;
    }

    setActiveTab(tab: Tab) {
        this.activeTabDispose?.dispose();
        this.activeTab = tab;
        this.editor!.setModel(this.createOrRetriveModel(tab));
        this.editor!.updateOptions(getEditorConfigForLanguage(tab.language));

        if (!tab.completion) {
            return;
        }

        const { monaco } = this.props;

        const getSuggestions = once(async () => {
            return Promise.all(tab.completion!(this.props.node));
        });

        this.activeTabDispose = monaco.languages.registerCompletionItemProvider(
            tab.language,
            {
                provideCompletionItems: async (model, position) => {
                    const word = model.getWordUntilPosition(position);
                    const range = {
                        startLineNumber: position.lineNumber,
                        endLineNumber: position.lineNumber,
                        startColumn: word.startColumn,
                        endColumn: word.endColumn,
                    };
                    const plainSugestions = await getSuggestions();
                    return {
                        suggestions: plainSugestions.map((sug) => ({
                            label: sug,
                            kind: monaco.languages.CompletionItemKind.Function,
                            insertText: sug,
                            range,
                        })),
                    };
                },
            }
        );
    }

    render() {
        return (
            <div style={{ height: "100%", width: "100%" }}>
                <ul>
                    {this.props.tabs.map((tab) => (
                        <li>
                            <button onClick={() => this.setActiveTab(tab)}>
                                {tab.label} {tab.id}
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
                        name="carbonCodePreview"
                    ></iframe>
                </div>
                <form
                    ref={(el) => (this.propertyFormField = el!)}
                    target="carbonCodePreview"
                    action="/neos/codePen/render/"
                    method="post"
                >
                    <input
                        type="hidden"
                        name="__csrfToken"
                        value={
                            document.getElementById("appContainer")!.dataset
                                .csrfToken
                        }
                    ></input>
                    <input
                        type="hidden"
                        name="node"
                        value={this.props.node!.contextPath}
                    ></input>
                    <input
                        type="hidden"
                        name="propertyName"
                        value={this.props.property}
                    ></input>
                    <input
                        type="hidden"
                        name="propertyValue"
                        ref={(el) => (this.propertyValueField = el!)}
                    ></input>
                </form>
            </div>
        );
    }
}
