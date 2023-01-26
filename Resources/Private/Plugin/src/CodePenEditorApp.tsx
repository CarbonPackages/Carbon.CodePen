import React, { useCallback, useMemo, useRef } from "react";
import { selectors, actions } from "@neos-project/neos-ui-redux-store";
import { EditorProps } from "@neos-project/neos-ts-interfaces";
import { PackageFrontendConfiguration } from "./manifest";
import { CodePenEditorOptions, Tab } from "./types";
import { CodePenButton } from "./components/CodePenButton";
import { retrieveMonacoEditorAndPlugins } from "./dependencyLoader";
import { afxMappedLanguageId } from "./services/afxMappedLanguageId";
import { Observable, shareReplay } from "rxjs";
import { CodePenPresenter, createCodePenPresenter } from "./presenter/CodePenPresenter";
import { CodePenWindow } from "./components/CodePenWindow";
import { createRetrieveOrCreateModel } from "./MonacoEditorModelCache";
import { Store } from "@neos-project/neos-ui";

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

        const codePenPresenter = useRef<CodePenPresenter>()

        const toggleCodePenWindow = () => {
            props.renderSecondaryInspector(
                "CARBON_CODEPEN_WINDOW",
                () => <CodePenWindow codePenPresenter={codePenPresenter.current!} />
            );
        };

        const tabValues$ = useMemo(() => {
            // todo i think its never fully closed? eg memory leak?
            return new Observable<TabValues>((subscriber) => {
                subscriber.next(props.value)
                let lastValue;
                const unsubscribe = deps.store.subscribe(() => {
                    const transientValuesByPropertyId = selectors.UI.Inspector.transientValues(deps.store.getState());
                    let newValue;
                    if (transientValuesByPropertyId && props.identifier in transientValuesByPropertyId) {
                        newValue = transientValuesByPropertyId[props.identifier].value;
                    } else {
                        const currentNode = selectors.CR.Nodes.focusedSelector(deps.store.getState())!;
                        newValue = currentNode.properties[props.identifier]
                    }
                    if (newValue !== lastValue) {
                        subscriber.next(newValue)
                    }
                    lastValue = newValue
                })
                return unsubscribe
            }).pipe(
                shareReplay(1)
            )
        }, [])

        const handleClick = useCallback(async () => {
            if (codePenPresenter.current) {
                codePenPresenter.current.toggleCodePenWindow()
                return;
            }

            const {monaco, monacoTailwindCss} = await retrieveMonacoEditorAndPlugins({
                frontendConfiguration: deps.frontendConfiguration
            });

            // waht if not on current node anymore?

            const node = selectors.CR.Nodes.focusedSelector(deps.store.getState())!;

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

            const retrieveOrCreateModel = createRetrieveOrCreateModel({monaco, cacheIdPrefix: node.contextPath + props.identifier})

            codePenPresenter.current = createCodePenPresenter({
                node,
                tabs,
                nodeTabProperty: props.identifier,
                tabValues$
            }, {
                toggleCodePenWindow,
                applyTabValues,
                commitTabValues,
                resetTabValues,
                requestLogin,
                monaco,
                monacoTailwindCss,
                retrieveOrCreateModel,
            })

            codePenPresenter.current.toggleCodePenWindow()

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
