import { test } from "./fixture"

test('neos content element out of band rendering', async ({ neos }) => {
    await neos.withCleanDocument(async ({document}) => {
        await document.withContentElement("Carbon.TestSite:BasicCodePen", async ({contentElement}) => {
            await contentElement.withCodePen(async ({codePen}) => {
                await codePen.fill("Hallo Welt")
            })

            await contentElement.previewToContainText(`Fusion (Carbon.TestSite:BasicCodePen)null`)
            await contentElement.apply()
            await contentElement.previewToContainText(`Fusion (Carbon.TestSite:BasicCodePen){"html":"Hallo Welt"}`)
        })
    })
})
