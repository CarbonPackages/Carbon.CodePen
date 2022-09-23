import { test, sleep, NodeType } from "./fixture"

for (const nodeType of [
    new NodeType("Carbon.TestSite:HtmlFeaturesCodePen").optional(),
    new NodeType("Carbon.TestSite:AfxFeaturesCodePen")
]) {
    test(`emmet ${nodeType}`, async ({ neos }) => {            
        await neos.withSharedDocument(async ({document}) => {
            await document.withContentElement(nodeType, async ({contentElement}) => {
                await contentElement.withCodePen(async ({codePen}) => {
                    await codePen.type("div")
                    await codePen.expect("div")
                    await sleep(500);
                    await codePen.pressTab()
                    await codePen.expect("<div></div>")
                })
            })
        })
    });
}
