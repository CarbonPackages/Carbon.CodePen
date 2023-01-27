import { Icon } from "@neos-project/react-ui-components";
import styled, { css } from "styled-components";

export const CodePenContainer = styled.div`
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    position: absolute;
`;

export const EditorAndPreviewContainer = styled.div<{ column: boolean }>`
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

export const TabNavigation = styled.ul`
    display: flex;
    margin: 0;
    padding: 0;
    list-style: none;
    background: #141414;
    border-bottom: 1px solid #3f3f3f;
`;

export const TabItem = styled.li<{ active: boolean }>`
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

export const TabButton = styled.button`
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

export const TabIcon = styled(Icon)`
    color: currentColor;
`;
