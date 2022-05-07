import { IDisposable } from "monaco-editor";
import { PackageFrontendConfiguration } from "./manifest";

export const registerDocumentationForFusionObjects = (
    monaco: typeof import("monaco-editor"),
    fusionObjects: PackageFrontendConfiguration["afx"]["fusionObjects"],
    languageId: string
): IDisposable | undefined => {
    const fusionObjectsWithDoc = Object.entries(fusionObjects)
        .filter(([, { documentation }]) => documentation)
        .map(([name]) => name);

    if (!fusionObjectsWithDoc.length) {
        return;
    }

    return monaco.languages.registerHoverProvider(languageId, {
        provideHover(model, position) {
            const currentLine = position.lineNumber;
            const currentCursor = position.column;

            const line = model.getLineContent(currentLine);
            if (line.trim() === "") {
                return null;
            }

            const regex = `<(${fusionObjectsWithDoc.join("|")})\\b`;

            const matches = line.matchAll(new RegExp(regex, "g"));

            for (const match of matches) {
                const [, matchedTag] = match;
                const startPosition = match.index! + 1 + 1; // +1 to remove < // +1 to convert to column
                const endPosition = startPosition + matchedTag.length;
                if (
                    currentCursor >= startPosition &&
                    currentCursor <= endPosition
                ) {
                    return {
                        range: new monaco.Range(
                            currentLine,
                            startPosition,
                            currentLine,
                            endPosition
                        ),
                        contents: [
                            {
                                value: fusionObjects[matchedTag].documentation!,
                            },
                        ],
                    };
                }
            }
            return null;
        },
    });
};
