# Build custom tailwindcss config

In order to write the custom config for tailwindcss, you can add a file (e.g. `codepen.js`) to the root of your installation

```js
const fs = require("fs");

const PATH = "./Packages/Carbon/Carbon.CodePen/Resources/Private/Build/";
const DIRECTORY = "./DistributionPackages/Vendor.Package/Resources/Public/Scripts/";
const CONFIG_FILE = "./tailwind.config.js";

fs.access(`${PATH}downloadTailwindCDN.js`, fs.F_OK, (error) => {
    if (error) {
        console.warn("Carbon.CodePen is not installed");
        return;
    }
    const downloadTailwindCDN = require(`${PATH}downloadTailwindCDN.js`);
    const buildTailwindConfig = require(`${PATH}buildTailwindConfig.js`);
    downloadTailwindCDN(DIRECTORY + "TailwindCDN.js");
    buildTailwindConfig(DIRECTORY + "TailwindConfig.js", CONFIG_FILE);
});
```

or, if you want to use modules:

```js
import fs from "fs";

const PATH = "./Packages/Carbon/Carbon.CodePen/Resources/Private/Build/";
const DIRECTORY = "./DistributionPackages/Vendor.Package/Resources/Public/Scripts/";
const CONFIG_FILE = "./tailwind.config.mjs";

fs.access(`${PATH}downloadTailwindCDN.js`, fs.F_OK, async (error) => {
    if (error) {
        console.warn("Carbon.CodePen is not installed");
        return;
    }
    const { downloadTailwindCDN } = await import(`${PATH}downloadTailwindCDN.mjs`);
    const { buildTailwindConfig } = await import(`${PATH}buildTailwindConfig.mjs`);
    downloadTailwindCDN(DIRECTORY + "TailwindCDN.js");
    buildTailwindConfig(DIRECTORY + "TailwindConfig.js", CONFIG_FILE);
});
```

To set a specific version, you can add the version like this: `downloadTailwindCDN(DIRECTORY + "TailwindCDN.js", "3.2.4");`

> If can occur that the download script can have problems to write files. In that case, you can use `curl`:  
`curl -o DistributionPackages/Vendor.Package/Resources/Public/Scripts/TailwindCDN.js https://cdn.tailwindcss.com -L;`

Please adjust the constant `DIRECTORY` to your needs. You can call later this script with node: `node ./codepen.js`

To enable tailwindcss in codepen add following setting:

```yaml
Neos:
  Neos:
    Ui:
      frontendConfiguration:
        "Carbon.CodePen":
          tailwindcss:
            enabled: true
            clientConfig: "${StaticResource.uri('Vendor.Package', 'Public/Scripts/TailwindConfig.js')}"
```

In order to have the classes also rendered in the backend, add `TailwindCDN.js` and `TailwindConfig.js` in the backend.
If you use `Carbon.IncludeAssets` you can do it like follows:

```yaml
Carbon:
  IncludeAssets:
    Packages:
      "CodePen":
        Package: "Vendor.Package"
        Backend:
          Head:
            - TailwindCDN.js
            - TailwindConfig.js
```
