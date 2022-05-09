import React from "react";
import { getEditorConfigForLanguage } from "../editorConfig";
import { IDisposable, editor } from "monaco-editor";
import { Node } from "@neos-project/neos-ts-interfaces";
import debounce from "lodash.debounce";
import { PackageFrontendConfiguration } from "../manifest";
import { Icon } from "@neos-project/react-ui-components";
import { Tab } from "./types";
import { registerCompletionForTab } from "./registerCompletionForTab";
import styled, { css } from "styled-components";
import { MonacoTailwindcss } from "monaco-tailwindcss";

type IdentfierFromNodeAndProperty = string;
type ActiveModels = Record<IdentfierFromNodeAndProperty, editor.ITextModel>;

let activeModelsByIdAndTabId: ActiveModels = {};

interface Props {
    tabs: Tab[];
    node: Node;
    property: string;
    monaco: typeof import("monaco-editor");
    monacoTailwindCss?: MonacoTailwindcss;
    packageFrontendConfiguration: PackageFrontendConfiguration;
    renderPreviewOutOfBand(): Promise<string>;
    onToggleEditor(): void;
    onSave(): void;
}

const CodePenContainer = styled.div`
    height: 100%;
    width: 100%;
`;

const EditorAndPreviewContainer = styled.div<{ column: boolean }>`
    display: flex;
    height: 100%;
    width: 100%;
    & > * {
        height: 100%;
        width: 50%;
    }

    ${({ column }) =>
        column &&
        css`
            flex-direction: column;
            & > * {
                height: 50%;
                width: 100%;
            }
        `}
`;

const TabNavigation = styled.ul`
    display: flex;
    margin: 0;
    padding: 0;
    list-style: none;
    background: #141414;
    border-bottom: 1px solid #3f3f3f;
`;

const TabItem = styled.li<{ active: boolean }>`
    position: relative;
    display: block;
    font-size: 14px;
    margin: 0;
    height: 40px;
    padding: 0 16px;
    line-height: 40px;
    cursor: pointer;
    border-right: 1px solid #3f3f3f;

    ${({ active }) =>
        active &&
        css`
            background-color: #222;
            color: #00adee;
        `}

    &::after {
        display: block;
        content: "";
        position: absolute;
        height: 2px;
        width: 100%;
        top: 0; // or -1px
        right: 0;
        ${({ active }) =>
            active &&
            css`
                background: #00adee;
            `}
    }
`;

const TabButton = styled.button`
    color: currentColor;
    font-size: 14px;
    margin: 0;
    display: inline-block;
    height: 40px;
    line-height: 40px;
    cursor: pointer;
    border: 0;
    background: 0;
    font-family: "Noto Sans", sans-serif;
    font-weight: normal;
    &:focus {
        outline: 0;
    }
`;

const TabIcon = styled(Icon)`
    color: currentColor;
`;

type State = {
    activeTab: Tab;
    previewModeColumn: boolean;
};

export default class CodeEditorWrap extends React.Component<Props, State> {
    private codePenContainer?: HTMLElement;
    private monacoContainer?: HTMLElement;
    private changer;

    private disposables: (IDisposable | undefined)[] = [];
    private activeTabDisposable?: IDisposable;

    private editor?: editor.IStandaloneCodeEditor;

    constructor(props: Props) {
        super(props);
        this.state = {
            activeTab: this.props.tabs[0],
            previewModeColumn: false,
        };
    }

    async componentDidMount() {
        if (!this.monacoContainer) {
            return;
        }

        const { monaco } = this.props;

        const editor = monaco.editor.create(this.monacoContainer, {
            theme: "vs-dark",
            automaticLayout: true,
        });

        this.editor = editor;

        this.editorChangeToTab(this.state.activeTab);

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

        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyQ, () => {
            this.props.onToggleEditor();
        });

        editor.addAction({
            id: "carbon.fullscreen",
            label: "Fullscreen",
            keybindings: [monaco.KeyCode.F11],
            contextMenuGroupId: "navigation",
            contextMenuOrder: 1.5,
            run: () => this.codePenContainer!.requestFullscreen(),
        });

        this.disposables = [
            ...this.disposables,
            editor,
            editor.onDidChangeModelContent(() => {
                const newTabValue = editor.getValue();
                this.state.activeTab.setValue(newTabValue);

                if (this.changer) {
                    this.changer({
                        tabValue: newTabValue,
                        tabId: this.state.activeTab.id,
                    });
                }
            }),
        ];
    }

    componentWillUnmount() {
        this.activeTabDisposable?.dispose();
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

    changeToTab(tab: Tab) {
        this.editorChangeToTab(tab);
        this.setState({ activeTab: tab });
    }

    editorChangeToTab(tab: Tab) {
        this.editor!.setModel(this.createOrRetriveModel(tab));
        this.editor!.updateOptions(getEditorConfigForLanguage(tab.language));

        const { monaco, node } = this.props;
        this.activeTabDisposable?.dispose();
        this.activeTabDisposable = registerCompletionForTab(monaco, node, tab);
    }

    togglePreview() {
        this.setState(({ previewModeColumn }) => ({
            previewModeColumn: !previewModeColumn,
        }));
    }

    iframeReady = (e: React.SyntheticEvent<HTMLIFrameElement>) => {
        console.log("iframeReady");

        type ContentChangeListener = (args: {
            tabId: string;
            tabValue: string;
        }) => void;

        type Param = {
            onDidChangeEditorContent(
                callback: ContentChangeListener,
                debounce?: number
            ): void;

            library: {
                generateStylesFromContent(
                    baseCss: string,
                    content: string[]
                ): Promise<string>;
                renderPreviewOutOfBand(): Promise<string>;
            };
        };

        const codePenContext: Param = {
            onDidChangeEditorContent: (callback, debounceTimeout) => {
                this.changer = debounce(callback, debounceTimeout);
            },
            library: {
                renderPreviewOutOfBand: this.props.renderPreviewOutOfBand,
                generateStylesFromContent:
                    this.props.monacoTailwindCss.generateStylesFromContent,
            },
        };

        // we use the iframe window as api. If `initializeCarbonCodpen` was registered we will use it.
        const iframeWindow = e.currentTarget.contentWindow!;
        const iframeDocument = iframeWindow.document;

        if (iframeWindow.initializeCarbonCodpen) {
            iframeWindow.initializeCarbonCodpen(codePenContext);
        } else {
            codePenContext.onDidChangeEditorContent(async ({ tabValue }) => {
                // codePenContext.library
                //     .renderPreviewOutOfBand()
                //     .then((content) => {
                //         iframeDocument.body.innerHTML = content;
                //     });

                iframeDocument.body.innerHTML = tabValue;

                codePenContext.library
                    .generateStylesFromContent(
                        `@tailwind base;
                        @tailwind components;
                        @tailwind utilities;`,
                        [tabValue]
                    )
                    .then((css) => {
                        const style =
                            iframeDocument.getElementById("_codePenTwStyle");
                        const newStyle = iframeDocument.createElement("style");
                        newStyle.id = "_codePenTwStyle";
                        newStyle.innerHTML = css;
                        if (style) {
                            style.parentNode!.replaceChild(newStyle, style!);
                        } else {
                            iframeDocument.head.append(newStyle);
                        }
                    });
            });
        }

        // trigger initial run
        this.changer({
            tabValue: this.state.activeTab.getValue(),
            tabId: this.state.activeTab.id,
        });
    };

    render() {
        this.editor?.layout();
        return (
            <CodePenContainer ref={(el) => (this.codePenContainer = el!)}>
                <TabNavigation>
                    <TabItem
                        active={this.state.previewModeColumn}
                        role="presentation"
                    >
                        <TabButton onClick={() => this.togglePreview()}>
                            <TabIcon icon="sync" />
                        </TabButton>
                    </TabItem>

                    {this.props.tabs.map((tab) => (
                        <TabItem
                            active={tab.id === this.state.activeTab.id}
                            role="presentation"
                            key={tab.id}
                            style={{ padding: "0 16px" }}
                        >
                            <TabButton
                                onClick={() => this.changeToTab(tab)}
                                role="tab"
                            >
                                <TabIcon
                                    style={{ marginRight: "0.5em" }}
                                    icon={tab.icon}
                                />
                                {tab.label}
                            </TabButton>
                        </TabItem>
                    ))}
                </TabNavigation>

                <EditorAndPreviewContainer
                    column={this.state.previewModeColumn}
                >
                    <div ref={(el) => (this.monacoContainer = el!)} />
                    <div>
                        <iframe
                            style={{
                                height: "100%",
                                width: "100%",
                                background: "#fff",
                            }}
                            onLoad={this.iframeReady}
                            srcDoc={`
                                <!DOCTYPE html>
                                <html>
                                    <head>
                                        <meta charset="utf-8">
                                        <meta name="viewport" content="width=device-width, initial-scale=1">
                                    </head>
                                    <body>

                                    </body>
                                </html>
                            `}
                        ></iframe>
                    </div>
                </EditorAndPreviewContainer>
            </CodePenContainer>
        );
    }
}
