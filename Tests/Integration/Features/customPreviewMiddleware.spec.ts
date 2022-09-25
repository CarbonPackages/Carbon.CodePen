import { test } from "./fixture"

test("custom preview middleware", async ({ neos }) => {
    await neos.withSharedDocument(async ({document}) => {
        await document.withContentElement("Carbon.TestSite:CustomMiddlewareCodePen", async ({contentElement}) => {
            await contentElement.withCodePen(async ({codePen}) => {
                await codePen.selectTab("Tab A")
                await codePen.fill("Moin")
                await codePen.expectPreview(`{"tabValues":{"a":"Moin"},"tabId":"a"}`)
                await codePen.selectTab("Tab B")
                await codePen.fill("Mojn")
                await codePen.expectPreview(`{"tabValues":{"a":"Moin","b":"Mojn"},"tabId":"b"}`)
            })
        })
    })
})
