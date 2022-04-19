import { TailwindConfig } from "tailwindcss/tailwind-config";
// side effect import that will initialize the worker already
import { initialize } from "monaco-tailwindcss/tailwindcss.worker.js";

/**
 * Initializes the worker with the passed tailwindConfig
 * If this function is not called, this worker will initialize without embedded config
 *
 * @param {TailwindConfig} tailwindConfig will be embedded into the the webworker
 *
 * @example
 * import config from "./tailwind.config.js";
 * initializeFromStaticConfig(config);
 *
 * @api
 */
export function initializeFromStaticConfig(tailwindConfig: TailwindConfig) {
    // overrides the previous initialization
    initialize({
        prepareTailwindConfig() {
            return tailwindConfig;
        },
    });
}
