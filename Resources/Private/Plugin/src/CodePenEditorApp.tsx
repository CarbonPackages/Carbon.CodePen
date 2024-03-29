import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { selectors, actions } from "@neos-project/neos-ui-redux-store";
import { EditorProps } from "@neos-project/neos-ts-interfaces";
import { PackageFrontendConfiguration } from "./manifest";
import { CodePenEditorOptions, Tab } from "./types";
import { CodePenButton } from "./components/CodePenButton";
import { retrieveMonacoEditorAndPlugins } from "./dependencyLoader";
import { afxMappedLanguageId } from "./services/afxMappedLanguageId";
import { CodePenPresenter, createCodePenPresenter } from "./presenter/CodePenPresenter";
import { CodePenWindow } from "./components/CodePenWindow";
import { Store } from "@neos-project/neos-ui";
import { usePreventAccidentalExit } from "./utils/usePreventAccidentalExit";
import { Icon } from "@neos-project/react-ui-components";
import styled from "styled-components";
import { makeCreateValueStreamFromNodeProperty } from "./services/createValueStreamFromNodeProperty";

const transformTabsConfiguration = (rawTabConfig: CodePenEditorOptions["tabs"]) => {
    if (!rawTabConfig) {
        throw new Error(
            `Carbon.CodePen cannot be initialized, because no tabs were defined in editiorOptions.`
        );
    }

    return Object.entries(rawTabConfig).map(
        ([id, { label, language, completion, icon }]) => ({
            id,
            label: label ?? `${language} [${id}]`,
            language:
                language === "afx"
                    ? afxMappedLanguageId
                    : language ?? "html",
            icon: icon ?? "file",
            completion,
        })
    );
}

type TabValues = Record<string, string>;

type Props = EditorProps<CodePenEditorOptions, TabValues>;

export const createCodePenEditorApp = (deps: {store: Store, frontendConfiguration: PackageFrontendConfiguration}) => {
    const createValueStreamFromNodeProperty = makeCreateValueStreamFromNodeProperty({ store: deps.store })

    const CodePenEditorApp = (props: Props) => {

        usePreventAccidentalExit();

        const node = useMemo(() => selectors.CR.Nodes.focusedSelector(deps.store.getState())!, [])

        const createCodePenPresenterFromContext = useCallback(async () => {
            const {monaco, monacoTailwindCss} = await retrieveMonacoEditorAndPlugins({
                frontendConfiguration: deps.frontendConfiguration
            });

            const applyTabValues = props.onEnterKey

            // nope its not commit(null); to reset, but will be treated as null.
            const resetTabValues = () => props.commit("");

            const commitTabValues = props.commit;

            const requestLogin = () => deps.store.dispatch(actions.System.authenticationTimeout());

            let tabs: Tab[];
            try {
                tabs = transformTabsConfiguration(props.options?.tabs);
            } catch (e) {
                const { message } = e as Error;
                console.error((e as Error).message);
                deps.store.dispatch(actions.UI.FlashMessages.add("CARBON_CODEPEN", message, "error"))
                return;
            }

            const previewFrame = props.options?.previewFrame;
            const nodeRenderer = props.options?.nodeRenderer;

            const tabValues$ = createValueStreamFromNodeProperty<TabValues>(props.identifier);

            return createCodePenPresenter({
                node,
                tabs,
                previewFrame,
                nodeRenderer,
                nodeTabProperty: props.identifier,
                tabValues$,
                toggleCodePenWindow: handleClick,
                applyTabValues,
                commitTabValues,
                resetTabValues,
                requestLogin,
                monaco,
                monacoTailwindCss,
            })
        }, [])

        const handleClick = useCallback(() => {
            props.renderSecondaryInspector(
                "CARBON_CODEPEN_WINDOW",
                () => <SecondaryInspector createCodePenPresenter={createCodePenPresenterFromContext} />
            )
        }, [])

        return (
            <div>
                <CodePenButton
                    className={props.className}
                    disabled={props.options?.disabled}
                    label={props.label}
                    onClick={handleClick}
                />
                {props.renderHelpIcon()}
            </div>
        );
    }

    return CodePenEditorApp;
}

const SecondaryInspector = (props: { createCodePenPresenter: () => Promise<CodePenPresenter | undefined> }) => {
    const [loading, setLoading] = useState(true);

    const codePenPresenter = useRef<CodePenPresenter>()

    useEffect(() => {
        props.createCodePenPresenter().then(
            (result) => {
                if (!result) {
                    return;
                }
                codePenPresenter.current = result
                setLoading(false)
            }
        )
        return () => {
            codePenPresenter.current?.dispose();
        }
    }, [])

    if (loading) {
        return <LoadingContainer>
            <Icon icon="spinner" spin={true} size="2x" />
        </LoadingContainer>
    }

    return <CodePenWindow codePenPresenter={codePenPresenter.current!} />
}

const LoadingContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
`
