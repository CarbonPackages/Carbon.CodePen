import { test } from "./fixture"

test('editor gui and preview', async ({ neos }) => {
    await neos.withSharedDocument(async ({document}) => {
        await document.withContentElement("Carbon.TestSite:BasicCodePen", async ({contentElement}) => {
            await contentElement.withCodePen(async ({codePen}) => {
                await codePen.expectToHaveScreenshot("plain.png")
                await codePen.expectPreview(`Fusion (Carbon.TestSite:BasicCodePen)null`)
                await codePen.fill("Hallo Welt")
                await codePen.expectPreview(`Fusion (Carbon.TestSite:BasicCodePen){"html":"Hallo Welt"}`)
                await codePen.expectToHaveScreenshot("plainWithText.png")
            })
        })
    })
})


test('editor preview is preserved after toggling editor', async ({ neos }) => {
    await neos.withSharedDocument(async ({document}) => {
        await document.withContentElement("Carbon.TestSite:BasicCodePen", async ({contentElement}) => {
            await contentElement.withCodePen(async ({codePen}) => {
                await contentElement.previewToContainText(`Fusion (Carbon.TestSite:BasicCodePen)null`)
                await codePen.fill("Hallo Welt")
                await codePen.expectPreview(`Fusion (Carbon.TestSite:BasicCodePen){"html":"Hallo Welt"}`)
            })

            await contentElement.withCodePen(async ({codePen}) => {
                await codePen.expect("Hallo Welt")
                await codePen.expectPreview(`Fusion (Carbon.TestSite:BasicCodePen){"html":"Hallo Welt"}`)
            })

            await contentElement.discard()

            await contentElement.withCodePen(async ({codePen}) => {
                await codePen.expectEmpty()
                await contentElement.previewToContainText(`Fusion (Carbon.TestSite:BasicCodePen)null`)
            })
        })
    })
})

test('editor rotation', async ({ neos }) => {
    await neos.withSharedDocument(async ({document}) => {
        await document.withContentElement("Carbon.TestSite:BasicCodePen", async ({contentElement}) => {
            await contentElement.withCodePen(async ({codePen}) => {
                await codePen.toogleRotation();
                await codePen.expectToHaveScreenshot("rotated.png")

                await codePen.toogleRotation();
                await codePen.expectToHaveScreenshot("plain.png")
            })
        })
    })
})
