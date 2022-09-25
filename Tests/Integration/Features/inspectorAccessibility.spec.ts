import { test } from "./fixture"

test('the open diagram label is translated', async ({ neos }) => {
    await neos.withSharedDocument(async ({document}) => {
        await document.withContentElement("Carbon.TestSite:AccessibleCodePen", async ({contentElement}) => {
            await contentElement.toHaveTranslatedOpener()
        })
    })
})

test('the help message is shown', async ({ neos }) => {
    test.skip(true, "Not implemented!")
    await neos.withSharedDocument(async ({document}) => {
        await document.withContentElement("Carbon.TestSite:BasicCodePen", async ({contentElement}) => {
            await contentElement.expectHelpTextToContain("Here you can edit the diagram")
        })
    })
})
