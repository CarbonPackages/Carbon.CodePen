import { test, configureTest } from "./fixture"

configureTest()

test('typing', async ({ neos }) => {
    await neos.withSharedDocument(async ({document}) => {
        await document.withContentElement("Carbon.TestSite:BasicCodepen", async ({contentElement}) => {
            await contentElement.withCodePen(async ({codePen}) => {
                await codePen.fill("Hello")
                await codePen.expect("Hello")

                await codePen.type(" Moin")
                await codePen.expect("Hello Moin")

                await codePen.fill("Hey")
                await codePen.expect("Hey")

                await codePen.insert(" Grüzi")
                await codePen.expect("Hey Grüzi")

                await codePen.insert(" Grüzi")

                await codePen.clear()
                await codePen.expectEmpty()
            })
        })
    })
});