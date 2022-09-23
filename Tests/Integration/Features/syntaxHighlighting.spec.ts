import { test, NodeType } from "./fixture"

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

for (const [nodeType, codeSnippet, screenshotName] of [
    [new NodeType("Carbon.TestSite:HtmlFeaturesCodePen").optional(), html, "htmlSyntax.png"],
    [new NodeType("Carbon.TestSite:AfxFeaturesCodePen"), afx, "afxSyntax.png"],
    [new NodeType("Carbon.TestSite:YamlFeaturesCodePen"), yaml, "yamlSyntax.png"],
] as const) {
    test(`Syntax-Highlighting ${nodeType}`, async ({ neos }) => {
        await neos.withSharedDocument(async ({document}) => {
            await document.withContentElement(nodeType, async ({contentElement}) => {
                await contentElement.withCodePen(async ({codePen}) => {
                    await codePen.fill(codeSnippet)
                    await codePen.expectInputToHaveScreenshot(screenshotName)
                })
            })
        })
    });
}
