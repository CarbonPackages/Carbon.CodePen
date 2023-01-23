import { IDisposable } from "monaco-editor";
import { Tab, RawCompletion } from "../types";
import once from "lodash.once";
import { Node } from "@neos-project/neos-ts-interfaces";

const CLIENT_COMPLETION_PREFIX = "ClientCompletion:";

type MaybePromise<Value> = Promise<Value> | Value

type MaybeFunction<Value> = (() => Value) | Value

type WrappedCompletions = MaybePromise<Array<MaybePromise<string>>>

const handleClientCompletion = (rawCompletion: RawCompletion, node: Node): WrappedCompletions | RawCompletion => {
    if (
        typeof rawCompletion === "string" &&
        rawCompletion.startsWith(CLIENT_COMPLETION_PREFIX)
    ) {
        const evaluator = new Function(
            "node",
            "return " + rawCompletion.slice(CLIENT_COMPLETION_PREFIX.length)
        );
        const maybeFunction = evaluator(node) as MaybeFunction<WrappedCompletions>
        if (typeof maybeFunction === "function") {
            // legacy - remove me? why return a higher oder function like:
            // ClientCompletion:() => "Hi"
            return maybeFunction();
        }
        return maybeFunction;
    }
    return rawCompletion;
}

export const registerCompletionForTab = (
    monaco: typeof import("monaco-editor"),
    node: Node,
    tab: Tab
): IDisposable | undefined => {
    if (!tab.completion) {
        return;
    }

    const getSuggestions = once(async (): Promise<string[]> => {
        const rawCompletion = tab.completion!;

        const maybeOuterPromiseCompletions = handleClientCompletion(rawCompletion, node)

        const maybeInnerPromiseCompletions = await maybeOuterPromiseCompletions

        const completions = Array.isArray(maybeInnerPromiseCompletions)
            ? await Promise.all(maybeInnerPromiseCompletions)
            : maybeInnerPromiseCompletions

        if (
            typeof completions === "string"
            || Array.isArray(completions) === false
            || completions.some((completion) => typeof completion !== "string")
        ) {
            console.error(
                `Carbon.CodePen: completion must be of string[] or better expressed: MaybePromise<array<MaybePromise<string>>>. Invalid completion option in current tab: "${tab.id}":`,
                rawCompletion,
                `resolved as:`,
                completions
            );
            return [];
        }

        return completions;
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
