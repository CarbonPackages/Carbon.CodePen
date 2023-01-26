import manifest from "@neos-project/neos-ui-extensibility";
import { createCodePenEditorApp } from "./CodePenEditorApp";
import { CodePenWindow } from "./components/CodePenWindow";

export interface PackageFrontendConfiguration {
    /**
     * Options for the tailwindcss support
     */
    tailwindcss: {
        /**
         * Enable Tailwind css support for the monaco editor.
         */
        enabled: boolean;
        /**
         * Provide a custom tailwind configuartion for the editor.
         * You can decide to insert a Json string or a http URI to a Javascript bundle of your config.
         */
        clientConfig?: string;
    };
    /**
     * Options for the afx support
     */
    afx: {
        /**
         * Configure the fusion objects relevant for AFX
         * you can add a custom expand snippet ala vscode syntax
         * or provide some markdown configuration
         */
        fusionObjects: {
            [fusionObject: string]: {
                documentation?: string;
                snippet?: string;
            };
        };
    };
}

manifest("Carbon.CodePen", {}, (globalRegistry, { store, frontendConfiguration}) => {
    const editorsRegistry = globalRegistry.get("inspector").get("editors");
    const secondaryEditorsRegistry = globalRegistry
        .get("inspector")
        .get("secondaryEditors");

    editorsRegistry.set("Carbon.CodePen/CodeEditor", {
        component: createCodePenEditorApp({
            store,
            frontendConfiguration: frontendConfiguration["Carbon.CodePen"] as PackageFrontendConfiguration
        }),
        hasOwnLabel: true,
    });

    secondaryEditorsRegistry.set("Carbon.CodePen/CodeEditorWrap", {
        component: CodePenWindow,
    });
});
