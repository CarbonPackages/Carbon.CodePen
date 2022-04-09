import manifest from "@neos-project/neos-ui-extensibility";

import CodeEditor from "./components/CodeEditor";
import CodeEditorWrap from "./components/CodeEditorWrap";

export interface PackageFrontendConfiguration {
    clientTailwindConfig: string | undefined;
}

let config: PackageFrontendConfiguration;

manifest(
    "Carbon.CodeEditor",
    {},
    (globalRegistry, { frontendConfiguration }) => {
        const editorsRegistry = globalRegistry.get("inspector").get("editors");
        const secondaryEditorsRegistry = globalRegistry
            .get("inspector")
            .get("secondaryEditors");

        config = frontendConfiguration[
            "Carbon.CodeEditor"
        ] as PackageFrontendConfiguration;

        editorsRegistry.set("Carbon.CodeEditor/CodeEditor", {
            component: CodeEditor,
            hasOwnLabel: true,
        });

        secondaryEditorsRegistry.set("Carbon.CodeEditor/CodeEditorWrap", {
            component: CodeEditorWrap,
        });
    }
);

export const getPackageFrontendConfiguration = () => config;
