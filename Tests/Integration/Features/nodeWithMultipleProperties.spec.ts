import { test } from "./fixture"

test('node with inline editable, multiple properties', async ({ neos }) => {
    await neos.withSharedDocument(async ({document}) => {
        await document.withContentElement("Carbon.TestSite:MultiplePropertiesCodePen", async ({contentElement}) => {
            await contentElement.previewToContainText(`Fusion (Carbon.TestSite:MultiplePropertiesCodePen){codePen1:empty,codePen2:empty,text1:valueText,text2:valueText,text3:valueText}`)

            await contentElement.withCodePen(async ({codePen}) => {
                await codePen.fill("valueCodePen")
                await codePen.expectPreview(`Fusion (Carbon.TestSite:MultiplePropertiesCodePen){codePen1:valueCodePen,codePen2:valueCodePen,text1:valueText,text2:valueText,text3:valueText}`)
            })
        })
    })
})
