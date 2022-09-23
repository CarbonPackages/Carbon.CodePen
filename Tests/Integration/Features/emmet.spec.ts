import { test, optional, sleep } from "./fixture"

for (const nodeTypeName of ["Carbon.TestSite:HtmlFeaturesCodePen", ...optional("Carbon.TestSite:AfxFeaturesCodePen")]) {
    test(`emmet ${nodeTypeName}`, async ({ neos }) => {            
        await neos.withSharedDocument(async ({document}) => {
            await document.withContentElement(nodeTypeName, async ({contentElement}) => {
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
