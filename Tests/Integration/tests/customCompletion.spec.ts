import { test, configureTest } from "./fixture"

configureTest()

test("custom completion", async ({ neos }) => {
    await neos.withSharedDocument(async ({document}) => {
        await document.withContentElement("Carbon.TestSite:CustomCompletionCodePen", async ({contentElement}) => {
            await contentElement.withCodePen(async ({codePen}) => {
                for (const [tabName, triggerCharacters, fullCompletion] of [
                    ["Tab A", "xxx", "xxxCompletion1TabA"],
                    ["Tab B", "xxx", "xxxCompletion1TabB"],
                    ["Tab C", "xxx", "xxxCompletion1TabC"],
                    ["Tab A", "xxx", "xxxCompletion1TabA"]
                ]) {
                    await codePen.selectTab(tabName)
                    await codePen.typeSlowly(triggerCharacters)
                    if (tabName === "Tab A") {
                        // todo
                        // only yaml needs force completion
                        await codePen.forceComplection()
                    }
                    await codePen.expectSuggestionsContain(fullCompletion)
                    await codePen.pressTab()
                    await codePen.expect(fullCompletion)
                    await codePen.clear()
                }
            })
            await contentElement.discard()
        })

        await document.withContentElement("Carbon.TestSite:CustomCompletionCodePen", async ({contentElement}) => {
            await contentElement.withCodePen(async ({codePen}) => {
                const [tabName, triggerCharacters, fullCompletion] = ["Tab A", "xxx", "xxxCompletion1TabA"];

                await codePen.selectTab(tabName)
                await codePen.typeSlowly(triggerCharacters)
                await codePen.forceComplection()
                await codePen.expectSuggestionsContain(fullCompletion)
                await codePen.pressTab()
                await codePen.expect(fullCompletion)
                await codePen.clear()
            })
        })
    })
})
