import { Node } from "@neos-project/neos-ts-interfaces";
import { fetchWithErrorHandling } from "@neos-project/neos-ui-backend-connector";
import debounce from "lodash.debounce";
import { editor as monacoEditor, IDisposable } from "monaco-editor";
import { MonacoTailwindcss } from "monaco-tailwindcss";
import { BehaviorSubject, first, lastValueFrom, Observable, withLatestFrom } from "rxjs";
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
    changeToTab(tab: Tab): void;
    togglePreviewLayoutHorizontal(): void;
    configureIframePreviewBeforeLoad(iframe: HTMLIFrameElement): void;
    toggleCodePenWindow(): void;
    configureAndRenderMonaco(
        monacoContainer: HTMLElement,
        codePenContainer: HTMLElement
    ): void;
    dispose(): void;
    iFramePreviewUri: string;
    tabs: Tab[];
    activeTab$: Observable<Tab>;
    previewLayoutHorizontal$: Observable<boolean>;
}

type Deps = {
    node: Node;
    nodeTabProperty: string;
    tabValues$: Observable<TabValues>;
    tabs: Tab[];

    toggleCodePenWindow(): void;

    applyTabValues(): void;
    commitTabValues(propertyValue: PropertyValue): void;
    resetTabValues(): void;
    requestLogin(): void;

    monaco: typeof import("monaco-editor");
    monacoTailwindCss?: MonacoTailwindcss;
    createMonacoEditorModel(tab: Tab, currentTabValue: string | undefined): monacoEditor.ITextModel;
}

const previewLayoutHorizontal$ = new BehaviorSubject(false);

type PropertyValue = Record<string, string>;

type TabValues = Record<string, string>;


export const createCodePenPresenter = (deps: Deps): CodePenPresenter => {
    const { monaco } = deps;

    let editor: monacoEditor.IStandaloneCodeEditor;

    let disposables: IDisposable[] = [];

    let activeTabDisposables: IDisposable[] = [];

    const activeTab$ = new BehaviorSubject(deps.tabs[0])

    const createIframePreviewUriForNode = (node: Node) => {
        const action = "renderPreviewFrame";
        const query = `node=${node.contextPath}`;
        return `/neos/codePen/${action}?${query}`;
    }

    const dispose = () => {
        for (const disposeable of disposables) {
            disposeable.dispose();
        }
    }

    const iFramePreviewUri = createIframePreviewUriForNode(deps.node);

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

    const togglePreviewLayoutHorizontal = () => {
        previewLayoutHorizontal$.next(!previewLayoutHorizontal$.getValue());
    }

    const monacoChangeEditorToTab = (activeTab: Tab, currentTabValue: string | undefined) => {
        editor.setModel(deps.createMonacoEditorModel(activeTab, currentTabValue));
        editor.updateOptions(getEditorConfigForLanguage(activeTab.language));

        for (const disposeable of activeTabDisposables) {
            disposeable.dispose();
        }

        /** @ts-expect-error */
        activeTabDisposables = [
            registerCompletionForTab(deps.monaco, deps.node, activeTab),
        ].filter(Boolean);
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

        const changeTabSubscription = activeTab$.pipe(
            withLatestFrom(
                deps.tabValues$
            ),
        ).subscribe(([activeTab, tabValues]) => monacoChangeEditorToTab(activeTab, tabValues[activeTab.id]))

        const modelContent$ = new Observable<string>((subscribe) => {
            const { dispose } = editor.onDidChangeModelContent(() => {
                subscribe.next(editor.getValue())
            })
            return dispose;
        })

        const modelContentWithActiveTabAndTabValues$ = modelContent$.pipe(
            withLatestFrom(
                activeTab$,
                deps.tabValues$
            )
        )

        const commitValuesSubscription = modelContentWithActiveTabAndTabValues$.subscribe(([modelContent, activeTab, tabValues]) => {
            mutateValueOfTab(activeTab, modelContent, tabValues);
        })

        disposables = [
            ...disposables,
            editor,
            { dispose: () => changeTabSubscription.unsubscribe() },
            { dispose: () => commitValuesSubscription.unsubscribe() }
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
                // find a more reliable way to determine login page
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

        const reloadIFrameSubscription = deps.tabValues$.pipe(
            withLatestFrom(
                activeTab$
            ),
        ).subscribe(([tabValues, activeTab]) => previewContentChangeListener({
            tabId: activeTab.id,
            tabValues
        }))

        disposables = [...disposables, {
            dispose: () => reloadIFrameSubscription.unsubscribe()
        }]
    }

    const renderComponentOutOfBand = async () => {
        const tabValues = await lastValueFrom(
            deps.tabValues$.pipe(
                first()
            )
        )
        return fetchAction("renderVirtualNode", {
            node: deps.node.contextPath,
            additionalPropertyName: deps.nodeTabProperty,
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

        // find a more reliable way to determine login page
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
        togglePreviewLayoutHorizontal,
        dispose,
        configureIframePreviewBeforeLoad,
        iFramePreviewUri,
        tabs: deps.tabs,
        activeTab$,
        previewLayoutHorizontal$
    }
}
