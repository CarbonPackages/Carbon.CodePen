import { IDisposable } from "monaco-editor";
import { PackageFrontendConfiguration } from "../manifest";
// not api see https://github.com/troy351/emmet-monaco-es/issues/102
import { isValidLocationForEmmetAbbreviation } from "emmet-monaco-es/src/abbreviationActions";

export const registerCompletionForFusionObjects = (
    monaco: typeof import("monaco-editor"),
    fusionObjects: PackageFrontendConfiguration["afx"]["fusionObjects"],
    languageId: string
): IDisposable | undefined => {
    const fusionObjectsWithSnippet = Object.entries(fusionObjects).filter(
        ([, { snippet }]) => snippet
    );

    if (!fusionObjectsWithSnippet.length) {
        return;
    }

    return monaco.languages.registerCompletionItemProvider(languageId, {
        triggerCharacters: [
            "!",
            ".",
            "}",
            ":",
            "*",
            "$",
            "]",
            "/",
            ">",
            "0",
            "1",
            "2",
            "3",
            "4",
            "5",
            "6",
            "7",
            "8",
            "9",
        ],
        provideCompletionItems(model, position) {
            const word = model.getWordUntilPosition(position);

            const range = {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: word.startColumn,
                endColumn: word.endColumn,
            };

            if (
                !isValidLocationForEmmetAbbreviation(
                    model,
                    position,
                    "html",
                    "html"
                )
            ) {
                return;
            }

            return {
                suggestions: fusionObjectsWithSnippet.map(
                    ([label, { documentation, snippet }]) => ({
                        label,
                        range,
                        insertText: snippet!,
                        insertTextRules:
                            monaco.languages.CompletionItemInsertTextRule
                                .InsertAsSnippet,
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        documentation,
                    })
                ),
            };
        },
    });
};
