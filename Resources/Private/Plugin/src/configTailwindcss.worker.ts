import { Config } from "tailwindcss";
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
        (self as any).importScripts(tailwindConfigUri);
    } catch (e) {
        console.error(
            `Carbon.CodeEditor: 'tailwindcss.clientConfig' is not a valid URI to a 'tailwindConfig'.${
                (e as Error).message
            }`
        );
    }

    if (!(self as any).tailwindConfig && !(self as any).tailwind?.config) {
        console.error(
            `Carbon.CodeEditor: 'tailwindcss.clientConfig' URI was fetched but it doesnt expose 'self.tailwindConfig' or 'self.tailwind.config'.`
        );
    }

    return (self as any).tailwindConfig || (self as any).tailwind.config;
};

const handleJsonConfig = (tailwindConfig: string) => {
    try {
        const tailwindConfigJson = JSON.parse(tailwindConfig);
        if (typeof tailwindConfigJson !== "object" || tailwindConfig === null) {
            throw Error("Config is not a JS object.");
        }
        return tailwindConfigJson as Config;
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
