import { test, configureTest, optional } from "./fixture"

configureTest()

for (const nodeTypeName of ["Carbon.TestSite:HtmlFeaturesCodePen", ...optional("Carbon.TestSite:AfxFeaturesCodePen")]) {
    test(`emmet ${nodeTypeName}`, async ({ neos }) => {            
        await neos.withSharedDocument(async ({document}) => {
            await document.withContentElement(nodeTypeName, async ({contentElement}) => {
                await contentElement.withCodePen(async ({codePen}) => {
                    await codePen.type("div")
                    await codePen.expect("div")
                    await codePen.pressTab()
                    await codePen.expect("<div></div>")
                })
            })
        })
    });
}
