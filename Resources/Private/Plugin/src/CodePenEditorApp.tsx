import React, { useCallback, useMemo, useRef } from "react";
import { selectors, actions } from "@neos-project/neos-ui-redux-store";
import { EditorProps } from "@neos-project/neos-ts-interfaces";
import { PackageFrontendConfiguration } from "./manifest";
import { CodePenEditorOptions, Tab } from "./types";
import { CodePenButton } from "./components/CodePenButton";
import { retrieveMonacoEditorAndPlugins } from "./dependencyLoader";
import { afxMappedLanguageId } from "./services/afxMappedLanguageId";
import { distinctUntilChanged, map, Observable, shareReplay, takeWhile, throttleTime } from "rxjs";
import { CodePenPresenter, createCodePenPresenter } from "./presenter/CodePenPresenter";
import { CodePenWindow } from "./components/CodePenWindow";
import { makeCreateMonacoEditorModel } from "./services/makeCreateMonacoEditorModel";
import { Store } from "@neos-project/neos-ui";
import { usePreventAccidentalExit } from "./utils/usePreventAccidentalExit";

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
    const neosStoreTick$ = new Observable<void>((subscriber) => {
        subscriber.next();
        const unsubscribe = deps.store.subscribe(() => {
            subscriber.next();
        });
        return unsubscribe;
    })

    const CodePenEditorApp = (props: Props) => {

        usePreventAccidentalExit();

        const codePenPresenter = useRef<CodePenPresenter>()

        // will not change and update its properties
        const node = useMemo(() => selectors.CR.Nodes.focusedSelector(deps.store.getState())!, [])

        const createCodePenPresenterFromContext = async (): Promise<CodePenPresenter | undefined> => {
            const {monaco, monacoTailwindCss} = await retrieveMonacoEditorAndPlugins({
                frontendConfiguration: deps.frontendConfiguration
            });

            const applyTabValues = props.onEnterKey

            // nope its not commit(null); to reset, but will be treated as null.
            const resetTabValues = () => props.commit("");

            const commitTabValues = props.commit;

            const requestLogin = () => deps.store.dispatch(actions.System.authenticationTimeout());

            const toggleCodePenWindow = () => props.renderSecondaryInspector(
                "CARBON_CODEPEN_WINDOW",
                () => <CodePenWindow codePenPresenter={codePenPresenter.current!} />
            );
    
            let tabs: Tab[];
            try {
                tabs = transformTabsConfiguration(props.options.tabs);
            } catch (e) {
                console.error((e as Error).message);
                return;
            }

            const tabValues$ = neosStoreTick$.pipe(
                throttleTime(50),
                takeWhile(() => selectors.CR.Nodes.focusedSelector(deps.store.getState())?.contextPath === node.contextPath),
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
                shareReplay(1)
            )

            const createMonacoEditorModel = makeCreateMonacoEditorModel({monaco, cacheIdPrefix: node.contextPath + props.identifier});

            return createCodePenPresenter({
                node,
                tabs,
                nodeTabProperty: props.identifier,
                tabValues$,
                toggleCodePenWindow,
                applyTabValues,
                commitTabValues,
                resetTabValues,
                requestLogin,
                monaco,
                monacoTailwindCss,
                createMonacoEditorModel,
            });
        }

        const handleClick = useCallback(async () => {
            codePenPresenter.current ??= await createCodePenPresenterFromContext();
            codePenPresenter.current?.toggleCodePenWindow();
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
