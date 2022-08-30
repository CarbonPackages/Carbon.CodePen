import { test, configureTest } from "./fixture"

configureTest()

test("afxTagCompletion", async ({ neos }) => {
    await neos.withSharedDocument(async ({document}) => {
        await document.withContentElement("Carbon.TestSite:AfxFeaturesCodePen", async ({contentElement}) => {
            await contentElement.withCodePen(async ({codePen}) => {
                await codePen.type("Loop")
                await codePen.pressTab()

                await codePen.type("itemsValue")
                await codePen.pressTab()

                await codePen.type("content")

                await codePen.expect(
                    `<Neos.Fusion:Loop items={itemsValue}>\n` +
                    `  content\n` +
                    `</Neos.Fusion:Loop>\n`
                )
            })
        })
    })
})

test("afxTagHover", async ({ neos }) => {
    await neos.withSharedDocument(async ({document}) => {
        await document.withContentElement("Carbon.TestSite:AfxFeaturesCodePen", async ({contentElement}) => {
            await contentElement.withCodePen(async ({codePen}) => {
                await codePen.fill("<Neos.Fusion:Loop />");
                await codePen.hoverOverText("Loop")
                await codePen.expectDocumentationsContain("Render each item in")
            })
        })
    })
})
