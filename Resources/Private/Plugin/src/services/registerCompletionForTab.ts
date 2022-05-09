import { IDisposable } from "monaco-editor";
import { Tab } from "../types";
import once from "lodash.once";
import { Node } from "@neos-project/neos-ts-interfaces";

export const registerCompletionForTab = (
    monaco: typeof import("monaco-editor"),
    node: Node,
    tab: Tab
): IDisposable | undefined => {
    if (!tab.completion) {
        return;
    }

    const getSuggestions = once(async () => {
        let { completion } = tab;
        if (
            typeof completion === "string" &&
            completion.startsWith("ClientEval:")
        ) {
            const clientEval = new Function(
                "node",
                "return " + completion.slice(11)
            );
            completion = clientEval(node);
            console.warn(
                `Carbon.CodePen: Hi you encountered a bug which is caused when updating a node and opening the code editor too fast. The 'ClientEval' is not evaluated by Neos yet. But we got you covered.`
            );
        }
        switch (typeof completion) {
            case "function":
                // @ts-expect-error
                if (!completion.__carbonCallback) {
                    console.warn(
                        "You are most likely using callbacks in ClientEval wrong. Unless you wrap them in `ClientEval:carbonCallback(...)` performance will suffer immensely: https://github.com/neos/neos-ui/issues/3117"
                    );
                }
                return Promise.all(completion({ node }));
            case "object":
                return Promise.all(completion);
            default:
                console.error(
                    `Carbon.CodePen: invalid completion in current tab: "${tab.id}". Completion: `,
                    completion
                );
                return [];
        }
    });

    return monaco.languages.registerCompletionItemProvider(tab.language, {
        provideCompletionItems: async (model, position) => {
            const word = model.getWordUntilPosition(position);
            const range = {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: word.startColumn,
                endColumn: word.endColumn,
            };
            const plainSugestions = await getSuggestions();
            return {
                suggestions: plainSugestions.map((sug) => ({
                    label: sug,
                    kind: monaco.languages.CompletionItemKind.Function,
                    insertText: sug,
                    range,
                })),
            };
        },
    });
};
