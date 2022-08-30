import { test, configureTest } from "./fixture"

configureTest()

test('emmet', async ({ neos }) => {
    await neos.withSharedDocument(async ({document}) => {
        await document.withContentElement("Carbon.TestSite:HtmlFeaturesCodePen", async ({contentElement}) => {
            await contentElement.withCodePen(async ({codePen}) => {
                await codePen.typeSlowly("div")
                await codePen.expect("div")
                await codePen.pressTab()
                await codePen.expect("<div></div>")
            })
        })
    })
});
