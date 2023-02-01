import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { selectors, actions } from "@neos-project/neos-ui-redux-store";
import { EditorProps } from "@neos-project/neos-ts-interfaces";
import { PackageFrontendConfiguration } from "./manifest";
import { CodePenEditorOptions, Tab } from "./types";
import { CodePenButton } from "./components/CodePenButton";
import { retrieveMonacoEditorAndPlugins } from "./dependencyLoader";
import { afxMappedLanguageId } from "./services/afxMappedLanguageId";
import { distinctUntilChanged, map, Observable, shareReplay } from "rxjs";
import { CodePenPresenter, createCodePenPresenter } from "./presenter/CodePenPresenter";
import { CodePenWindow } from "./components/CodePenWindow";
import { makeCreateMonacoEditorModel } from "./services/makeCreateMonacoEditorModel";
import { Store } from "@neos-project/neos-ui";
import { usePreventAccidentalExit } from "./utils/usePreventAccidentalExit";
import { Icon } from "@neos-project/react-ui-components";
import styled from "styled-components";

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
    const CodePenEditorApp = (props: Props) => {
        const SecondaryInspector = useCallback(() => {
            const [loading, setLoading] = useState(true);

            const codePenPresenter = useRef<CodePenPresenter>()

            const node = useMemo(() => selectors.CR.Nodes.focusedSelector(deps.store.getState())!, [])

            useEffect(() => {
                (async () => {
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
                        tabs = transformTabsConfiguration(props.options.tabs);
                    } catch (e) {
                        console.error((e as Error).message);
                        return;
                    }

                    const neosStoreTick$ = new Observable<void>((subscriber) => {
                        subscriber.next();
                        const unsubscribe = deps.store.subscribe(() => {
                            subscriber.next();
                        });
                        return unsubscribe;
                    })

                    const tabValues$ = neosStoreTick$.pipe(
                        map(() => {
                            // same logic as how the value will normally be acquired:
                            // https://github.com/neos/neos-ui/blob/6aa5c74e75e4813ffd798905811d099df30d5705/packages/neos-ui/src/Containers/RightSideBar/Inspector/InspectorEditorEnvelope/index.js#L81
                            const transientValuesByPropertyId = selectors.UI.Inspector.transientValues(deps.store.getState());
                            if (transientValuesByPropertyId && props.identifier in transientValuesByPropertyId) {
                                return transientValuesByPropertyId[props.identifier].value as TabValues;
                            } else {
                                const possiblyUpdatedNode = selectors.CR.Nodes.focusedSelector(deps.store.getState())!;
                                return possiblyUpdatedNode.properties[props.identifier] as TabValues
                            }
                        }),
                        distinctUntilChanged(),
                        shareReplay({
                            bufferSize: 1,
                            refCount: true, // unsubscribe at end
                        })
                    )

                    const createMonacoEditorModel = makeCreateMonacoEditorModel({monaco, cacheIdPrefix: node.contextPath + props.identifier});

                    codePenPresenter.current = createCodePenPresenter({
                        node,
                        tabs,
                        nodeTabProperty: props.identifier,
                        tabValues$,
                        toggleCodePenWindow: handleClick,
                        applyTabValues,
                        commitTabValues,
                        resetTabValues,
                        requestLogin,
                        monaco,
                        monacoTailwindCss,
                        createMonacoEditorModel,
                    })

                    setLoading(false)
                })()

                return () => {
                    codePenPresenter.current?.dispose();
                }
            }, [])

            if (loading) {
                const LoadingContainer = styled.div`
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                `
                return <LoadingContainer>
                    <Icon icon="spinner" spin={true} size="2x" />
                </LoadingContainer>
            }

            return <CodePenWindow codePenPresenter={codePenPresenter.current!} />
        }, [])

        usePreventAccidentalExit();

        const handleClick = useCallback(() => {
            props.renderSecondaryInspector(
                "CARBON_CODEPEN_WINDOW",
                () => <SecondaryInspector />
            )
        }, [])

        return (
            <div>
                <CodePenButton
                    className={props.className}
                    disabled={props.options.disabled}
                    label={props.label}
                    onClick={handleClick}
                />
                {props.renderHelpIcon()}
            </div>
        );
    }

    return CodePenEditorApp;
}
