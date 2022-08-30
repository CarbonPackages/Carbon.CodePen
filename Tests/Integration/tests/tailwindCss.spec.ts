import { test, configureTest } from "./fixture"

configureTest()

test("tailwind css", async ({ neos }) => {
    await neos.withSharedDocument(async ({document}) => {
        await document.withContentElement("Carbon.TestSite:TailwindCodePen", async ({contentElement}) => {
            await contentElement.withCodePen(async ({codePen}) => {
                await codePen.typeSlowly(`<div class="`)

                await codePen.pressEscape()

                await codePen.typeSlowly(`bg-red-8`)
                await codePen.expectSuggestionsContain("bg-red-800")

                await codePen.pressTab()
                await codePen.pressArrowRight();

                await codePen.typeSlowly(`>Moin</div>`);

                await codePen.expect(`<div class="bg-red-800">Moin</div>`)
              
                await codePen.expectInputToHaveScreenshot('tailwindSyntax.png')
            
                await codePen.expectPreviewToHaveScreenshot('tailwindPreview.png')
            })
        })
    })
})
