import { TailwindConfig } from "tailwindcss/tailwind-config";
import { initialize } from "monaco-tailwindcss/tailwindcss.worker.js";

initialize({
    prepareTailwindConfig(tailwindConfig) {
        if (!tailwindConfig) {
            return {};
        }

        if (
            typeof tailwindConfig === "string" &&
            tailwindConfig.trim().startsWith("{")
        ) {
            return handleJsonConfig(tailwindConfig);
        }

        if (
            typeof tailwindConfig === "string" &&
            tailwindConfig.trim().startsWith("http")
        ) {
            return handleJsScriptConfig(tailwindConfig);
        }

        if (typeof tailwindConfig === "object") {
            return tailwindConfig;
        }

        console.error(
            "Carbon.CodeEditor: invalid 'tailwindcss.clientConfig'",
            tailwindConfig
        );
        return {};
    },
});

const handleJsScriptConfig = (tailwindConfigUri: string) => {
    try {
        self.importScripts(tailwindConfigUri);
    } catch (e) {
        console.error(
            `Carbon.CodeEditor: 'tailwindcss.clientConfig' is not a valid URI to a 'tailwindConfig'.${
                (e as Error).message
            }`
        );
    }

    if (!self.tailwindConfig) {
        console.error(
            `Carbon.CodeEditor: 'tailwindcss.clientConfig' URI was fetched but it doesnt expose 'self.tailwindConfig'.`
        );
    }

    return self.tailwindConfig;
};

const handleJsonConfig = (tailwindConfig: string) => {
    try {
        const tailwindConfigJson = JSON.parse(tailwindConfig);
        if (typeof tailwindConfigJson !== "object" || tailwindConfig === null) {
            throw Error("Config is not a JS object.");
        }
        return tailwindConfigJson as TailwindConfig;
    } catch (e) {
        console.error(
            `Carbon.CodeEditor: 'tailwindcss.clientConfig' is not valid JSON object.${
                (e as Error).message
            }`
        );
        console.warn(tailwindConfig);
        return undefined;
    }
};
