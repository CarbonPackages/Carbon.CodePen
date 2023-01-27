import { Node } from "@neos-project/neos-ts-interfaces";
import { fetchWithErrorHandling } from "@neos-project/neos-ui-backend-connector";
import debounce from "lodash.debounce";
import { editor as monacoEditor, IDisposable } from "monaco-editor";
import { MonacoTailwindcss } from "monaco-tailwindcss";
import { BehaviorSubject, combineLatest, first, lastValueFrom, map, Observable, of, withLatestFrom } from "rxjs";
import { getEditorConfigForLanguage } from "../services/editorConfig";
import { registerCompletionForTab } from "../services/registerCompletionForTab";
import {
    CodePenContext,
    ConfigureCodePenBootstrap,
    ContentChangeListener,
    Tab,
} from "../types";
import { objectIsEmpty } from "../utils/helper";

export interface CodePenPresenter {
    state$: Observable<CodePenState>;
    changeToTab(tab: Tab): void;
    togglePreviewModeColumn(): void;
    configureIframePreviewBeforeLoad(iframe: HTMLIFrameElement): void;
    toggleCodePenWindow(): void;
    configureAndRenderMonaco(
        monacoContainer: HTMLElement,
        codePenContainer: HTMLElement
    ): void;
    codePenWindowDidClose(): void;
    staticIframePreviewUri: string;
}

type Props = {
    node: Node;
    nodeTabProperty: string;
    tabValues$: Observable<TabValues>;
    tabs: Tab[];
};

type Deps = {
    toggleCodePenWindow(): void;

    applyTabValues(): void;
    commitTabValues(propertyValue: PropertyValue): void;
    resetTabValues(): void;
    requestLogin(): void;

    monaco: typeof import("monaco-editor");
    monacoTailwindCss?: MonacoTailwindcss;
    retrieveOrCreateModel(tab: Tab, currentTabValue: string | undefined): monacoEditor.ITextModel;
}

export type CodePenState = {
    tabs: Tab[];
    activeTab?: Tab;
    previewModeColumn: boolean;
};

export const initalState: CodePenState = {
    tabs: [],
    previewModeColumn: false,
    activeTab: undefined,
};

const previewModeColumn$ = new BehaviorSubject(false);

type PropertyValue = Record<string, string>;

type TabValues = Record<string, string>;


export const createCodePenPresenter = (props: Props, deps: Deps): CodePenPresenter => {
    const { monaco } = deps;

    let editor: monacoEditor.IStandaloneCodeEditor;

    let activeTabDisposables: (IDisposable|undefined)[] = [];

    let codePenWindowDisposables: (IDisposable | undefined)[] = [];

    const activeTab$ = new BehaviorSubject(props.tabs[0])

    const createIframePreviewUriForNode = (node: Node) => {
        const action = "renderPreviewFrame";
        const query = `node=${node.contextPath}`;
        return `/neos/codePen/${action}?${query}`;
    }

    const codePenWindowDidClose = () => {
        for (const disposeable of codePenWindowDisposables) {
            disposeable?.dispose();
        }
    }

    const staticIframePreviewUri = createIframePreviewUriForNode(props.node);

    const tabs$ = of(props.tabs);

    const state$ = combineLatest([tabs$, activeTab$, previewModeColumn$]).pipe(
        map(([tabs, activeTab, previewModeColumn]) => ({
            tabs,
            activeTab,
            previewModeColumn
        }))
    )

    // todo without changes there should be no pending changes

    /**
     * Notifies the Neos UI that a tab content changed.
     * commit expects the final array value of the combined tabs,
     * so we instert the new change into the known values.
     */
    const mutateValueOfTab = ({ id }: Tab, newTabValue: string, tabValues: TabValues) => {    
        let newValue;
        if (newTabValue === "") {
            const {[id]: _omit, ...rest} = tabValues;
            newValue = rest
        } else {
            newValue = {
                ...tabValues,
                [id]: newTabValue
            }
        }
        if (objectIsEmpty(newValue)) {
            deps.resetTabValues();
            return;
        }
        deps.commitTabValues(newValue);
    }

    const togglePreviewModeColumn = () => {
        previewModeColumn$.pipe(first())
            .subscribe((previewModeColumn) => previewModeColumn$.next(!previewModeColumn))
    }

    const monacoChangeEditorToTab = (activeTab: Tab, currentTabValue: string | undefined) => {
        editor.setModel(deps.retrieveOrCreateModel(activeTab, currentTabValue));
        editor.updateOptions(getEditorConfigForLanguage(activeTab.language));

        for (const disposeable of activeTabDisposables) {
            disposeable?.dispose();
        }
        activeTabDisposables = [
            registerCompletionForTab(deps.monaco, props.node, activeTab),
        ];
    }

    const configureAndRenderMonaco = async (
        monacoContainer: HTMLElement,
        codePenContainer: HTMLElement
    ) => {

        editor = monaco.editor.create(
            monacoContainer,
            {
                theme: "vs-dark",
                automaticLayout: true,
            }
        );

        const subscription1 = activeTab$.pipe(
            withLatestFrom(
                props.tabValues$
            ),
        ).subscribe(([activeTab, tabValues]) => monacoChangeEditorToTab(activeTab, tabValues[activeTab.id]))
    
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

        editor.addCommand(
            monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
            deps.applyTabValues
        );

        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyQ, deps.toggleCodePenWindow);

        editor.addAction({
            id: "carbon.fullscreen",
            label: "Fullscreen",
            keybindings: [monaco.KeyCode.F11],
            contextMenuGroupId: "navigation",
            contextMenuOrder: 1.5,
            run: () => codePenContainer!.requestFullscreen(),
        });

        const modelContent$ = new Observable<string>((subscribe) => {
            const { dispose } = editor.onDidChangeModelContent(() => {
                subscribe.next(editor.getValue())
            })
            return dispose;
        })

        const modelContentWithActiveTabAndTabValues$ = modelContent$.pipe(
            withLatestFrom(
                activeTab$,
                props.tabValues$
            )
        )

        const subscription2 = modelContentWithActiveTabAndTabValues$.subscribe(([modelContent, activeTab, tabValues]) => {
            mutateValueOfTab(activeTab, modelContent, tabValues);
        })

        codePenWindowDisposables = [
            ...codePenWindowDisposables,
            editor,
            { dispose: () => subscription1.unsubscribe() },
            { dispose: () => subscription2.unsubscribe() }
        ];
    } 

    const changeToTab = (tab: Tab) => {
        activeTab$.next(tab);
    }

    const configureIframePreviewBeforeLoad = (iframe: HTMLIFrameElement) => {
        if (!iframe || !iframe.contentWindow) {
            console.error(`Cannot initialize iframe.`);
            return;
        }

        // we use the iframe window as api
        const iframeWindow = iframe.contentWindow;

        // hack to check onload if the session was timed out,
        // then we close the editor (destroy the iframe) and show the relogin
        iframeWindow.addEventListener(
            "load",
            () => {
                // TODO: Find a more reliable way to determine login page
                if (iframeWindow.document.querySelector(".neos-login-main")) {
                    closeWindowAndReloginOnSessionTimeOut();
                }
            }, { once: true }
        );

        // make it callable only once.
        let initialized = false;
        iframeWindow.configureCodePenPreview = (bootstrap) => {
            if (initialized) {
                return;
            }
            initialized = true;
            configureCodePenPreview(bootstrap);
        };
    }

    const configureCodePenPreview = (bootstrap: ConfigureCodePenBootstrap) => {
        let previewContentChangeListener: ContentChangeListener;

        const codePenContext: CodePenContext = {
            onContentDidChange: (listener, debounceTimeout) => {
                previewContentChangeListener = debounce(
                    listener,
                    debounceTimeout
                );
            },
            renderComponentOutOfBand,
            library: {
                generateTailwindStylesFromContent: deps.monacoTailwindCss?.generateStylesFromContent,
            },
        };

        bootstrap(codePenContext);

        const subscription = props.tabValues$.pipe(
            withLatestFrom(
                activeTab$
            ),
        ).subscribe(([tabValues, activeTab]) => previewContentChangeListener({
            tabId: activeTab.id,
            tabValues
        }))

        codePenWindowDisposables = [...codePenWindowDisposables, {
            dispose: () => subscription.unsubscribe()
        }]
    }

    const renderComponentOutOfBand = async () => {
        const tabValues = await lastValueFrom(
            props.tabValues$.pipe(
                first()
            )
        )
        return fetchAction("renderVirtualNode", {
            node: props.node.contextPath,
            additionalPropertyName: props.nodeTabProperty,
            additionalPropertyValue: JSON.stringify(
                tabValues
            ),
        });
    }

    const fetchAction = async (action: string, args: Record<string, string>): Promise<string> => {
        const result = await fetchWithErrorHandling
            .withCsrfToken((csrfToken) => ({
                url: `/neos/codePen/${action}`,
                method: "POST",
                credentials: "include",
                headers: {
                    "X-Flow-Csrftoken": csrfToken,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(args),
            }))
            .catch((reason) =>
                fetchWithErrorHandling.generalErrorHandler(reason)
            );

        const html = (await result.text()) as string;        

        // hack to check on out of band render if the session was timed out,
        // then we close the editor (destroy the iframe) and show the relogin

        // TODO: Find a more reliable way to determine login page
        if (html.includes("neos-login-main")) {
            closeWindowAndReloginOnSessionTimeOut();
            // @ts-expect-error this is not a problem for us ;)
            return;
        }
        return html;
    }

    const closeWindowAndReloginOnSessionTimeOut = () => {
        console.log(`Session timed out: Closing CodePen and relogin ...`);
        deps.requestLogin();
        deps.toggleCodePenWindow();
    }

    return {
        toggleCodePenWindow: deps.toggleCodePenWindow,
        configureAndRenderMonaco,
        changeToTab,
        state$,
        togglePreviewModeColumn,
        codePenWindowDidClose,
        configureIframePreviewBeforeLoad,
        staticIframePreviewUri
    }
} 
