import { test } from "./fixture"

test('live preview causes no side effects', async ({ neos }) => {
    await neos.withCleanDocument(async ({document}) => {
        await document.withContentElement("Carbon.TestSite:BasicCodePen", async ({contentElement}) => {
            await contentElement.withCodePen(async ({codePen}) => {
                await contentElement.previewToContainText(`Fusion (Carbon.TestSite:BasicCodePen)null`)
                await codePen.fill("Hallo Welt")
                await codePen.expectPreview(`Fusion (Carbon.TestSite:BasicCodePen){"html":"Hallo Welt"}`)
            })
            await contentElement.previewToContainText(`Fusion (Carbon.TestSite:BasicCodePen)null`)
        })

        await document.reload()

        await document.withExistingContentElement("Carbon.TestSite:BasicCodePen", async ({contentElement}) => {
            await contentElement.previewToContainText(`Fusion (Carbon.TestSite:BasicCodePen)null`)
        })
    })
})
