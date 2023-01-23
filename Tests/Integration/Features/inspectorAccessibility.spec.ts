import { test } from "./fixture"

test('the open codpen label is translated', async ({ neos }) => {
    await neos.withSharedDocument(async ({document}) => {
        await document.withContentElement("Carbon.TestSite:AccessibleCodePen", async ({contentElement}) => {
            await contentElement.toHaveTranslatedOpener()
        })
    })
})

test('the help message is shown', async ({ neos }) => {
    await neos.withSharedDocument(async ({document}) => {
        await document.withContentElement("Carbon.TestSite:AccessibleCodePen", async ({contentElement}) => {
            await contentElement.expectHelpTextToContain("Here you can edit the code")
        })
    })
})
