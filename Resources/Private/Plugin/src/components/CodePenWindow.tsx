import React, { useEffect, useRef } from "react";
import { CodePenPresenter, initalState } from "../presenter/CodePenPresenter";
import { useLatestValueFrom } from "../useLatestValueFrom";
import {
    CodePenContainer,
    EditorAndPreviewContainer,
    TabButton,
    TabIcon,
    TabItem,
    TabNavigation,
} from "./StyledComponents";

type Props = {
    codePenPresenter: CodePenPresenter;
};

export const CodePenWindow = (props: Props) => {
    const codePenContainer = useRef<HTMLElement | null>(null);
    const monacoContainer = useRef<HTMLElement | null>(null);
    const iframePreview = useRef<HTMLIFrameElement | null>(null);

    const state = useLatestValueFrom(props.codePenPresenter.state$, initalState);

    useEffect(() => {
        if (!monacoContainer.current || !codePenContainer.current || !iframePreview.current) {
            throw new Error("CodePenWindow refs not set.")
        }

        props.codePenPresenter.configureAndRenderMonaco(
            monacoContainer.current,
            codePenContainer.current
        );

        props.codePenPresenter.configureIframePreviewBeforeLoad(
            iframePreview.current
        );

        return props.codePenPresenter.codePenWindowDidClose
    }, [])

    return (
        <CodePenContainer ref={(el) => (codePenContainer.current = el)}>
            <TabNavigation>
                <TabItem
                    active={state.previewModeColumn}
                    role="presentation"
                >
                    <TabButton
                        onClick={props.codePenPresenter.togglePreviewModeColumn}
                    >
                        <TabIcon icon="window-maximize" />
                    </TabButton>
                </TabItem>

                {state?.tabs.map((tab) => (
                    <TabItem
                        active={tab.id === state.activeTab?.id}
                        role="presentation"
                        key={tab.id}
                        style={{ padding: "0 16px" }}
                    >
                        <TabButton
                            onClick={() =>
                                props.codePenPresenter.changeToTab(tab)
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
                column={state.previewModeColumn}
            >
                <div ref={(el) => (monacoContainer.current = el)} />
                <div>
                    <iframe
                        style={{
                            height: "100%",
                            width: "100%",
                            background: "#fff",
                            border: "none",
                        }}
                        ref={(el) => (iframePreview.current = el)}
                        // if we would put the uri into a setState,
                        // it wouldnt be set initially which leads to our window iframe api not working,
                        // as the source would change again and it reloads
                        src={props.codePenPresenter.staticIframePreviewUri}
                    ></iframe>
                </div>
            </EditorAndPreviewContainer>
        </CodePenContainer>
    );
}
