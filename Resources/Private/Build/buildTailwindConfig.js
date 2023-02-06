const esbuild = require("esbuild");
const path = require("node:path");

const resolveDir = path.join(__dirname, "../../../../../..");

function buildTailwindConfig(outfile) {
    if (!outfile) {
        throw new Error("No outfile specified in function buildTailwindConfig");
    }
    esbuild.build({
        outfile,
        format: "iife",
        stdin: {
            contents: `
            import config from "./Tailwind";
            self.tailwind = self.tailwind || {};
            self.tailwind.config = config;
            `,
            resolveDir,
        },
        bundle: true,
        minify: true,
    });
    console.log("");
    console.log("Wrote tailwind config to");
    console.log(outfile);
    console.log("");
}

module.exports = buildTailwindConfig;
