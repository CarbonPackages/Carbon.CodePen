/**
 * Esbuild build script to build a custom web worker with embedded "tailwind.config.js"
 * This way all plugins will be preserved.
 *
 * `node buildTailwindWorkerWithEmbeddedConfig.js ./Packages/Sites/Neos.Demo/Resources/Public/embeddedconfigtailwind.worker.js`
 */

const esbuild = require("esbuild");
const CarbonEditor = "./DistributionPackages/Carbon.CodeEditor/";

const [, , outfile] = process.argv;

esbuild.build({
    format: "iife",
    stdin: {
        contents: `
        import config from "./tailwind.config.js";
        import { initializeFromStaticConfig } from '${CarbonEditor}Resources/Public/extensibletailwind.worker.js';
        initializeFromStaticConfig(config)
        `,
        resolveDir: __dirname,
    },
    bundle: true,
    outfile,
    minify: true,
});
