import manifest from "@neos-project/neos-ui-extensibility";
import { carbonCallbackFactory } from "./carbonCallback";
import NeosUiCodePenApp from "./NeosUiCodePenApp";
import { CodePenWindow } from "./components/CodePenWindow";

export interface PackageFrontendConfiguration {
    tailwindcss: {
        /**
         * Enable Tailwind css support for the monaco editor.
         */
        enabled: boolean;

        /**
         * Uri for the worker to be used.
         * Its possible to configure this to a custom worker with embedded Tailwind config.
         * This way plugins from the tailwind config are preserved.
         */
        workerUri: string;

        /**
         * To be used with the default worker implementation.
         * A simple way to provide config as json.
         * Plugins (eg functions) of the tailwind config cannot not be preserved.
         */
        clientConfig?: string;
    };
    afx: {
        /**
         * Define fusion Objects to have auto completion and hover examples
         */
        fusionObjects: {
            [fusionObject: string]: {
                documentation?: string;
                snippet?: string;
            };
        };
    };
}

// Fixes https://github.com/neos/neos-ui/issues/3117
declare global {
    interface Window {
        carbonCallback: ReturnType<typeof carbonCallbackFactory>;
    }
}
window.carbonCallback = carbonCallbackFactory();

manifest("Carbon.CodePen", {}, (globalRegistry) => {
    const editorsRegistry = globalRegistry.get("inspector").get("editors");
    const secondaryEditorsRegistry = globalRegistry
        .get("inspector")
        .get("secondaryEditors");

    editorsRegistry.set("Carbon.CodePen/CodeEditor", {
        component: NeosUiCodePenApp,
        hasOwnLabel: true,
    });

    secondaryEditorsRegistry.set("Carbon.CodePen/CodeEditorWrap", {
        component: CodePenWindow,
    });
});
