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
import styled, { css } from "styled-components";

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

const CodePenContainer = styled.div`
    height: "100%";
    width: "100%";
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
    border-top: 1px solid #3f3f3f;
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
        top: 0;
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
    padding: 0 16px;
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
    margin-right: 0.5em;
`;

type State = {
    activeTab: Tab;
};

export default class CodeEditorWrap extends React.Component<Props, State> {
    private codePenContainer?: HTMLElement;
    private monacoContainer?: HTMLElement;
    private previewIframe?: HTMLIFrameElement;

    private disposables: (IDisposable | undefined)[] = [];
    private activeTabDisposable?: IDisposable;

    private editor?: editor.IStandaloneCodeEditor;

    constructor(props: Props) {
        super(props);
        this.state = {
            activeTab: this.props.tabs[0],
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

        editor.addCommand(monaco.KeyCode.Escape, () => {
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
                this.state.activeTab.setValue(editor.getValue());
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

    render() {
        return (
            <CodePenContainer ref={(el) => (this.codePenContainer = el!)}>
                <TabNavigation>
                    {this.props.tabs.map((tab) => (
                        <TabItem
                            active={tab.id === this.state.activeTab.id}
                            role="presentation"
                            key={tab.id}
                        >
                            <TabButton
                                onClick={() => this.changeToTab(tab)}
                                role="tab"
                            >
                                <TabIcon icon={tab.icon} />
                                {tab.label}
                            </TabButton>
                        </TabItem>
                    ))}
                </TabNavigation>

                <div
                    style={{ height: "40vh", width: "100%" }}
                    ref={(el) => (this.monacoContainer = el!)}
                ></div>

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
            </CodePenContainer>
        );
    }
}
