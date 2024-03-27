const https = require("https");
const fs = require("fs");

const CDN = "https://cdn.tailwindcss.com";

async function downloadTailwindCDN(outfile, version) {
    if (!outfile) {
        throw new Error("No outfile specified in function downloadTailwindCDN");
    }
    version = version ? `/${version}` : "";
    await downloadFile(CDN + version, outfile);
}

async function downloadFile(url, outfile) {
    return await new Promise((resolve, reject) => {
        https
            .get(url, (response) => {
                const code = response.statusCode ?? 0;

                if (code >= 400) {
                    return reject(new Error(response.statusMessage));
                }

                // handle redirects
                if (code > 300 && code < 400 && !!response.headers.location) {
                    return resolve(downloadFile(CDN + response.headers.location, outfile));
                }

                // create the directory if it doesn't exist
                const dir = outfile.substring(0, outfile.lastIndexOf("/"));
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }

                // save the file to disk
                const fileWriter = fs.createWriteStream(outfile);
                fileWriter.on("finish", () => {
                    fileWriter.close(() => {
                        try {
                            // Check if the file is a Tailwind error message
                            const data = fs.readFileSync(outfile, "utf8");
                            if (data.startsWith('console.error("Unknown Tailwind version:')) {
                                throw new Error("Unknown Tailwind version");
                            }
                        } catch (err) {
                            console.error(err);
                        }
                        resolve(console.log(`\nWrote ${url} to\n${outfile}\n`));
                    });
                });

                response.pipe(fileWriter);
            })
            .on("error", (error) => {
                reject(error);
            });
    });
}

module.exports = downloadTailwindCDN;
