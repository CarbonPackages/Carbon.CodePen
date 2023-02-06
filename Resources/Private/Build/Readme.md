# Build custom tailwindcss config

In order to write the custom config for tailwindcss, you can add a file (e.g. `codepen.js`) to the root of your installation

```js
const buildTailwindConfig = require("./Packages/Carbon/Carbon.CodePen/Resources/Private/Build/buildTailwindConfig.js");
const downloadTailwindCDN = require("./Packages/Carbon/Carbon.CodePen/Resources/Private/Build/downloadTailwindCDN.js");

const DIRECTORY = "./DistributionPackages/Vendor.Package/Resources/Public/Scripts/";

downloadTailwindCDN(DIRECTORY + "TailwindCDN.js");
buildTailwindConfig(DIRECTORY + "TailwindConfig.js");
```

To set a specific version, you can add the version like this: `downloadTailwindCDN(DIRECTORY + "TailwindCDN.js", "3.2.4");`

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
