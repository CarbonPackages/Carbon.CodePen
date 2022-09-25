/**
 * Json build script for "tailwind.config.js"
 *
 * `node buildJsonTailwindConfig.js ./Packages/Sites/Neos.Demo/Resources/Public/clientTailwindConfig.json`
 */

const fs = require("fs");
const config = require("./tailwind.config.js");

const [, , outfile] = process.argv;

const { theme } = config;

// we select only the theme option for json, as plugins cannot be converted to json.
// if you need plugins, look at buildBundledTailwindConfig
const clientTailwind = {
    theme,
};

fs.writeFileSync(outfile, JSON.stringify(clientTailwind));
