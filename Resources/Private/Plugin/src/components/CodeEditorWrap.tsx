import React from "react";
import { getEditorConfigForLanguage } from "../editorConfig";
import { IDisposable, editor } from "monaco-editor";
import { Node } from "@neos-project/neos-ts-interfaces";
import once from "lodash.once";
import debounce from "lodash.debounce";
import { PackageFrontendConfiguration } from "../manifest";
import { Icon } from "@neos-project/react-ui-components";
import { Tab } from "./types";

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

        const fusionObjectsWithDoc = Object.entries(fusionObjectsConfig)
            .filter(([, { documentation }]) => documentation)
            .map(([name]) => name);

        if (!fusionObjectsWithDoc.length) {
            return;
        }

        let disp;
        disp = monaco.languages.registerHoverProvider("html", {
            provideHover(model, position) {
                const currentLine = position.lineNumber;
                const currentCursor = position.column;

                const line = model.getLineContent(currentLine);
                if (line.trim() === "") {
                    return null;
                }

                const regex = `<(${fusionObjectsWithDoc.join("|")})\\b`;

                const matches = line.matchAll(new RegExp(regex, "g"));

                for (const match of matches) {
                    const [, matchedTag] = match;
                    const startPosition = match.index! + 1 + 1; // +1 to remove < // +1 to convert to column
                    const endPosition = startPosition + matchedTag.length;
                    if (
                        currentCursor >= startPosition &&
                        currentCursor <= endPosition
                    ) {
                        return {
                            range: new monaco.Range(
                                currentLine,
                                startPosition,
                                currentLine,
                                endPosition
                            ),
                            contents: [
                                {
                                    value: fusionObjectsConfig[matchedTag]
                                        .documentation!,
                                },
                            ],
                        };
                    }
                }
                return null;
            },
        });

        this.disposables.push(disp);
    }

    componentWillUnmount() {
        this.activeTabDispose?.dispose();
        for (const disposable of this.disposables) {
            disposable.dispose();
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
        this.activeTabDispose?.dispose();
        this.activeTab = tab;
        this.editor!.setModel(this.createOrRetriveModel(tab));
        this.editor!.updateOptions(getEditorConfigForLanguage(tab.language));

        if (!tab.completion) {
            return;
        }

        const { monaco } = this.props;

        const getSuggestions = once(async () => {
            let { completion } = tab;
            const { node } = this.props;
            if (
                typeof completion === "string" &&
                completion.startsWith("ClientEval:")
            ) {
                const clientEval = new Function(
                    "node",
                    "return " + completion.slice(11)
                );
                completion = clientEval(node);
                console.warn(
                    `Carbon.CodePen: Hi you encountered a bug which is caused when updating a node and opening the code editor too fast. The 'ClientEval' is not evaluated by Neos yet. But we got you covered.`
                );
            }
            switch (typeof completion) {
                case "function":
                    if (!completion.__carbonCallback) {
                        console.warn(
                            "You are most likely using callbacks in ClientEval wrong. Unless you wrap them in `ClientEval:carbonCallback(...)` performance will suffer immensely: https://github.com/neos/neos-ui/issues/3117"
                        );
                    }
                    return Promise.all(completion({ node }));
                case "object":
                    return Promise.all(completion);
                default:
                    console.error(
                        `Carbon.CodePen: invalid completion in tab: "${tab.id}" of property: "${this.props.property}" of nodeType: "${this.props.node.nodeType}"`
                    );
                    return [];
            }
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
