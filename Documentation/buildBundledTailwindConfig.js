/**
 * Esbuild build script to bundledTailwindConfig from your "tailwind.config.js"
 * This way all plugins will be preserved.
 *
 * `node buildBundledTailwindConfig.js ./Packages/Sites/Neos.Demo/Resources/Public/bundledTailwindConfig.js`
 */

const esbuild = require("esbuild");

const [, , outfile] = process.argv;

esbuild.build({
    outfile,
    format: "iife",
    stdin: {
        contents: `
        import config from "./tailwind.config.js";
        self.tailwind = self.tailwind || {};
        self.tailwind.config = config;
        `,
        resolveDir: __dirname,
    },
    bundle: true,
    minify: true,
});
