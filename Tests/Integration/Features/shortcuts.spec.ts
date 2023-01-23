import { test } from "./fixture"

test("save via shortcut", async ({ neos }) => {
    await neos.withCleanDocument(async ({document}) => {
        await document.withContentElement("Carbon.TestSite:BasicCodePen", async ({contentElement}) => {
            await contentElement.withCodePen(async ({codePen}) => {
                await codePen.type("Moinsen")
                await codePen.saveShortcut()
            })
            await contentElement.previewToContainText(`Fusion (Carbon.TestSite:BasicCodePen){"html":"Moinsen"}`)
        })
    })
})

test("close via shortcut", async ({ neos }) => {
    await neos.withCleanDocument(async ({document}) => {
        await document.withContentElement("Carbon.TestSite:BasicCodePen", async ({contentElement}) => {
            await contentElement.withCodePen(async ({codePen}) => {
                await codePen.closeShortcut()
                await contentElement.expectCodePenToBeClosed()
            })
        })
    })
})
