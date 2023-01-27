import { editor } from "monaco-editor";
import { Tab } from "../types";

const activeCachedModels: Record<string, editor.ITextModel> = {};

export const createRetrieveOrCreateMonacoEditorModel = (deps: {cacheIdPrefix: string, monaco: typeof import("monaco-editor")}) => {
    const retrieveOrCreateMonacoEditorModel = (tab: Tab, currentTabValue: string | undefined) => {
        const { language } = tab;
        const value = currentTabValue ?? '';

        const cacheIdentifier = deps.cacheIdPrefix + tab.id;

        const cachedModel = activeCachedModels[cacheIdentifier];

        if (cachedModel) {
            // both values are `strings` and empty ones "" if there is no content.
            if (cachedModel.getValue() !== value) {
                cachedModel.pushEditOperations(
                    [],
                    [
                        {
                            range: cachedModel.getFullModelRange(),
                            text: value,
                        },
                    ],
                    () => null
                );
            }
            return cachedModel;
        }

        const model = deps.monaco.editor.createModel(value, language);
        activeCachedModels[cacheIdentifier] = model;
        return model;
    }
    return retrieveOrCreateMonacoEditorModel;
}
