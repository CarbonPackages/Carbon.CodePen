import React from "react";
import { CodePenBloc, CodePenState } from "./CodePenBloc";
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
    private codePenContainer?: HTMLElement;
    private monacoContainer?: HTMLElement;

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
    }

    public componentWillUnmount() {
        this.props.codePenBloc.unsubscribe(this.listener);
        this.props.codePenBloc.windowClosed();
    }

    public render() {
        return (
            <CodePenContainer ref={(el) => (this.codePenContainer = el!)}>
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
                    <div ref={(el) => (this.monacoContainer = el!)} />
                    <div>
                        <iframe
                            style={{
                                height: "100%",
                                width: "100%",
                                background: "#fff",
                            }}
                            onLoad={({ currentTarget }) =>
                                this.props.codePenBloc.setUpIframePreview(
                                    currentTarget
                                )
                            }
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
