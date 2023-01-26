import { PackageFrontendConfiguration } from "./manifest";
import { MonacoTailwindcss } from "monaco-tailwindcss";

let monacoEditorAndPlugins: {
    monaco: typeof import("monaco-editor");
    monacoTailwindCss?: MonacoTailwindcss;
};

export const retrieveMonacoEditorAndPlugins = async (
    deps: {frontendConfiguration: PackageFrontendConfiguration}
) => {
    if (monacoEditorAndPlugins) {
        return monacoEditorAndPlugins;
    }

    const { initializeMonacoFromConfig } = await import(
        "./services/initializeMonaco"
    );

    monacoEditorAndPlugins = initializeMonacoFromConfig(
        deps.frontendConfiguration
    );

    return monacoEditorAndPlugins;
};
