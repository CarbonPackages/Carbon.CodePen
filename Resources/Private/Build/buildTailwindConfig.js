const esbuild = require("esbuild");
const path = require("node:path");

const resolveDir = path.join(__dirname, "../../../../../..");

function buildTailwindConfig(outfile, configFile = "./Tailwind") {
    if (!outfile) {
        throw new Error("No outfile specified in function buildTailwindConfig");
    }
    esbuild.build({
        outfile,
        format: "iife",
        stdin: {
            contents: `
            import config from "${configFile}";
            self.tailwind = self.tailwind || {};
            self.tailwind.config = config;
            `,
            resolveDir,
        },
        bundle: true,
        minify: true,
    });
    console.log(`\nWrote tailwind config to\n${outfile}\n`);
}

module.exports = buildTailwindConfig;
