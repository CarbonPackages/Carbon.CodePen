import { test, configureTest } from "./fixture"

configureTest()


test.describe("Language Features HTML,AFX,YAML", () => {

    const html = `<div>Foo Bar</div>
<div class="wieso baum">
</div>
<p>Darum</p>
`;

    const afx = `<div>Foo Bar</div>
<div class="wieso baum">
</div>
<Neos.Fusion:Tag a="b">
</Neos.Fusion:Tag>
`;

    const yaml = `Foo: "Bar"
wiesoBaum: Darum
jetzt: "aber raus hier"
`;

    for (const [testName, nodeTypeName, code, screenshotName] of [
        ["HTML Syntax-Highlighting", "Carbon.TestSite:HtmlFeaturesCodePen", html, "htmlSyntax.png"],
        ["AFX Syntax-Highlighting", "Carbon.TestSite:AfxFeaturesCodePen", afx, "afxSyntax.png"],
        ["YAML Syntax-Highlighting", "Carbon.TestSite:YamlFeaturesCodePen", yaml, "yamlSyntax.png"],
    ]) {
        test(testName, async ({ neos }) => {
            await neos.withSharedDocument(async ({document}) => {
                await document.withContentElement(nodeTypeName, async ({contentElement}) => {
                    await contentElement.withCodePen(async ({codePen}) => {
                        await codePen.fill(code)
                        await codePen.expectInputToHaveScreenshot(screenshotName)
                    })
                })
            })
        });
    }
})
