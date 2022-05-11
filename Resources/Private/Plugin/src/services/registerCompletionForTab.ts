import { IDisposable } from "monaco-editor";
import { Tab } from "../types";
import once from "lodash.once";
import { Node } from "@neos-project/neos-ts-interfaces";

const CLIENT_COMPLETION_ID = "ClientCompletion:";

export const registerCompletionForTab = (
    monaco: typeof import("monaco-editor"),
    node: Node,
    tab: Tab
): IDisposable | undefined => {
    if (!tab.completion) {
        return;
    }

    const getSuggestions = once(async (): Promise<string[]> => {
        const completionOption = tab.completion!;

        let processedCompletion = completionOption;
        if (
            typeof completionOption === "string" &&
            completionOption.startsWith(CLIENT_COMPLETION_ID)
        ) {
            const clientCompletion = new Function(
                "node",
                "return " + completionOption.slice(CLIENT_COMPLETION_ID.length)
            );
            processedCompletion = clientCompletion(node);
        }

        let suggestionPossiblePropmise = processedCompletion;
        if (typeof processedCompletion === "function") {
            suggestionPossiblePropmise = processedCompletion();
        }

        let suggestions = suggestionPossiblePropmise;
        if (Array.isArray(suggestionPossiblePropmise)) {
            suggestions = await Promise.all(suggestionPossiblePropmise);
        }

        if (
            Array.isArray(suggestions) === false ||
            suggestions.some((suggestion) => typeof suggestion !== "string")
        ) {
            console.error(
                `Carbon.CodePen: completion must be of type  string[] or Promise<string[]>. Invalid completion option in current tab: "${tab.id}":`,
                completionOption,
                `resolved as:`,
                suggestions
            );
            return [];
        }

        return suggestions as string[];
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
