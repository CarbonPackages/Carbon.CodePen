import { test, NodeType, sleep } from "./fixture"

test(`tailwind css own styles via json`, async ({ neos }) => {
    await neos.withFlowSubContext("TailwindJson", async () => {
        await neos.withCleanDocument(async ({document}) => {
            await document.withContentElement("Carbon.TestSite:HtmlFeaturesCodePen", async ({contentElement}) => {
                await contentElement.withCodePen(async ({codePen}) => {
                    await codePen.type(`<div class="`)

                    await codePen.pressEscape()

                    await codePen.type(`w-make`)
                    await codePen.expectSuggestionsContain("w-makeTheButtonBiggerJson")
                    await codePen.pressTab()

                    await codePen.type(` bg-marc`)
                    await codePen.expectSuggestionsContain("bg-marcherryJson")
                    await codePen.pressTab()

                    await codePen.expect(`<div class="w-makeTheButtonBiggerJson bg-marcherryJson"`)
                })
            })
        })
    })
})

test("tailwind css completion and live generation", async ({ neos }) => {
    await neos.withSharedDocument(async ({document}) => {
        await document.withContentElement("Carbon.TestSite:TailwindCodePen", async ({contentElement}) => {
            await contentElement.withCodePen(async ({codePen}) => {
                await codePen.type(`<div class="`)

                await codePen.pressEscape()

                await codePen.type(`bg-red-8`)
                await codePen.expectSuggestionsContain("bg-red-800")

                await codePen.pressTab()
                await codePen.pressArrowRight();

                await codePen.type(`>Moin</div>`);

                await codePen.expect(`<div class="bg-red-800">Moin</div>`)
              
                await sleep(250)
                await codePen.expectInputToHaveScreenshot('tailwindSyntax.png')
            
                await codePen.expectPreviewToHaveScreenshot('tailwindPreview.png')
            })
        })
    })
})


for (const nodeType of [
    new NodeType("Carbon.TestSite:TailwindCodePen").optional(),
    new NodeType("Carbon.TestSite:AfxFeaturesCodePen")
]) {
    test(`tailwind css completion with variants ${nodeType}`, async ({ neos }) => {
        await neos.withSharedDocument(async ({document}) => {
            await document.withContentElement(nodeType, async ({contentElement}) => {
                await contentElement.withCodePen(async ({codePen}) => {
                    await codePen.type(`<div class="`)

                    await codePen.pressEscape()

                    await codePen.type(`md`)
                    await codePen.expectSuggestionsContain("md:")
                    await codePen.pressTab()

                    await codePen.type(`hov`)
                    await codePen.expectSuggestionsContain("hover:")
                    await codePen.pressTab()

                    await codePen.type(`first-let`)
                    await codePen.expectSuggestionsContain("first-letter:")
                    await codePen.pressTab()


                    await codePen.type(`bg-red-8`)
                    await codePen.expectSuggestionsContain("bg-red-800")
                    await codePen.pressTab()

                    await codePen.expect(`<div class="md:hover:first-letter:bg-red-800"`)
                })
            })
        })
    })   
}

test("tailwind css own styles and variants", async ({ neos }) => {
    await neos.withSharedDocument(async ({document}) => {
        await document.withContentElement("Carbon.TestSite:TailwindCodePen", async ({contentElement}) => {
            await contentElement.withCodePen(async ({codePen}) => {
                await codePen.type(`<div class="`)

                await codePen.pressEscape()

                await codePen.type(`hocu`)
                await codePen.expectSuggestionsContain("hocus:")
                await codePen.pressTab()

                await codePen.type(`w-make`)
                await codePen.expectSuggestionsContain("w-makeTheButtonBigger")
                await codePen.pressTab()


                await codePen.type(` bg-marc`)
                await codePen.expectSuggestionsContain("bg-marcherry")
                await codePen.pressTab()

                await codePen.expect(`<div class="hocus:w-makeTheButtonBigger bg-marcherry"`)
            })
        })
    })
})
