import { PackageFrontendConfiguration } from "./manifest";
import { CodePenBloc } from "./bloc/CodePenBloc";

let codePenBloc: CodePenBloc;

export const provideCodePenPlock = async (
    frontendConfiguration: PackageFrontendConfiguration
) => {
    if (codePenBloc) {
        return codePenBloc;
    }

    const { initializeMonacoFromConfig } = await import(
        "./services/initializeMonaco"
    );

    const { monaco, monacoTailwindCss } = initializeMonacoFromConfig(
        frontendConfiguration
    );

    return (codePenBloc = new CodePenBloc(monaco, monacoTailwindCss));
};
