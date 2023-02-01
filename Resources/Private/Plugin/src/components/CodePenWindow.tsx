import React, { useEffect, useRef } from "react";
import { CodePenPresenter } from "../presenter/CodePenPresenter";
import { useLatestValueFrom } from "../utils/useLatestValueFrom";
import { Icon } from "@neos-project/react-ui-components";
import styled, { css } from "styled-components";

const CodePenContainer = styled.div`
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    position: absolute;
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


type Props = {
    codePenPresenter: CodePenPresenter;
};

export const CodePenWindow = (props: Props) => {
    const codePenContainer = useRef<HTMLDivElement | null>(null);
    const monacoContainer = useRef<HTMLDivElement | null>(null);
    const iframePreview = useRef<HTMLIFrameElement | null>(null);

    const activeTab = useLatestValueFrom(props.codePenPresenter.activeTab$);
    const previewModeColumn = useLatestValueFrom(props.codePenPresenter.previewModeColumn$);


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
        <CodePenContainer ref={codePenContainer}>
            <TabNavigation>
                <TabItem
                    active={previewModeColumn ?? false}
                    role="presentation"
                >
                    <TabButton
                        onClick={props.codePenPresenter.togglePreviewModeColumn}
                    >
                        <TabIcon icon="window-maximize" />
                    </TabButton>
                </TabItem>

                {props.codePenPresenter.tabs.map((tab) => (
                    <TabItem
                        active={tab.id === activeTab?.id}
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
                column={previewModeColumn ?? false}
            >
                <div ref={monacoContainer} />
                <div>
                    <iframe
                        style={{
                            height: "100%",
                            width: "100%",
                            background: "#fff",
                            border: "none",
                        }}
                        ref={iframePreview}
                        // src must be immediately set
                        src={props.codePenPresenter.iFramePreviewUri}
                    ></iframe>
                </div>
            </EditorAndPreviewContainer>
        </CodePenContainer>
    );
}
