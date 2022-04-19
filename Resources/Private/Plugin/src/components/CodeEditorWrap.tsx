import React from "react";
import { getEditorConfigForLanguage } from "../editorConfig";
import { IDisposable, editor } from "monaco-editor";

type IdentfierFromNodeAndProperty = string;
type ActiveModels = Record<IdentfierFromNodeAndProperty, editor.ITextModel>;

let activeModelsByIdAndTabId: ActiveModels = {};

type Tab = Readonly<{
    value: string;
    id: string;
    label: string;
    language: string;
}>;

interface Props {
    monaco: typeof import("monaco-editor");
    id: string;
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

    disposables: IDisposable[] = [];

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

        this.disposables = [
            ...this.disposables,
            editor,
            editor.onDidChangeModelContent(() => {
                this.props.onChange(this.activeTab!.id, editor.getValue());
            }),
        ];
    }

    componentWillUnmount() {
        for (const disposable of this.disposables) {
            disposable.dispose();
        }
    }

    getModel({ value, id, language }: Tab): editor.ITextModel {
        const cacheIdentifier = this.props.id + id;
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
        this.activeTab = tab;
        this.editor!.setModel(this.getModel(tab));
        this.editor!.updateOptions(getEditorConfigForLanguage(tab.language));
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
                    style={{ height: "100%", width: "100%" }}
                    ref={(el) => (this.monacoContainer = el!)}
                />
            </div>
        );
    }
}
