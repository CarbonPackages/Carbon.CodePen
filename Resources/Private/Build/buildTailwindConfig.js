const esbuild = require("esbuild");
const path = require("node:path");

const resolveDir = path.join(__dirname, "../../../../../..");

function buildTailwindConfig(
    outfile,
    configFile = "./Tailwind",
    settings,
) {
    if (!outfile) {
        throw new Error("No outfile specified in function buildTailwindConfig");
    }
    const contents = `
    import config from "${configFile}";
    self.tailwind = self.tailwind || {};
    self.tailwind.config = config${settings ? `(${JSON.stringify(settings)})` : ""};
    `;
    esbuild.build({
        outfile,
        format: "iife",
        stdin: {
            contents,
            resolveDir,
        },
        bundle: true,
        minify: true,
    });
    console.log(`\nWrote tailwind config to\n${outfile}\n`);
}

module.exports = buildTailwindConfig;
