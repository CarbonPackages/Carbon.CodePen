import React from "react";
import { CodePenBloc, CodePenState } from "../bloc/CodePenBloc";
import {
    CodePenContainer,
    EditorAndPreviewContainer,
    TabButton,
    TabIcon,
    TabItem,
    TabNavigation,
} from "./StyledComponents";

type Props = {
    codePenBloc: CodePenBloc;
};

export class CodePenWindow extends React.PureComponent<Props, CodePenState> {
    private codePenContainer?: HTMLElement | null;
    private monacoContainer?: HTMLElement | null;
    private iframePreview?: HTMLIFrameElement | null;

    public constructor(props: Props) {
        super(props);
        this.state = this.props.codePenBloc.state;
        this.props.codePenBloc.subscribe(this.listener);
    }

    private listener = (newState: CodePenState) => {
        this.setState(newState);
    };

    public componentDidMount() {
        this.props.codePenBloc.initializeMonaco(
            this.monacoContainer!,
            this.codePenContainer!
        );
        this.props.codePenBloc.setUpIframePreview(this.iframePreview!);
    }

    public componentWillUnmount() {
        this.props.codePenBloc.unsubscribe(this.listener);
        this.props.codePenBloc.windowClosed();
    }

    public render() {
        return (
            <CodePenContainer ref={(el) => (this.codePenContainer = el)}>
                <TabNavigation>
                    <TabItem
                        active={this.state.previewModeColumn}
                        role="presentation"
                    >
                        <TabButton
                            onClick={() =>
                                this.props.codePenBloc.togglePreview()
                            }
                        >
                            <TabIcon icon="sync" />
                        </TabButton>
                    </TabItem>

                    {this.state.tabs.map((tab) => (
                        <TabItem
                            active={tab.id === this.state.activeTab!.id}
                            role="presentation"
                            key={tab.id}
                            style={{ padding: "0 16px" }}
                        >
                            <TabButton
                                onClick={() =>
                                    this.props.codePenBloc.changeToTab(tab)
                                }
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
                    <div ref={(el) => (this.monacoContainer = el)} />
                    <div>
                        <iframe
                            style={{
                                height: "100%",
                                width: "100%",
                                background: "#fff",
                            }}
                            ref={(el) => (this.iframePreview = el)}
                            src={this.props.codePenBloc.state.iframePreviewUri}
                        ></iframe>
                    </div>
                </EditorAndPreviewContainer>
            </CodePenContainer>
        );
    }
}
