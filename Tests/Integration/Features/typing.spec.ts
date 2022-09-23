import { test, NodeType } from "./fixture"

for (const nodeType of [
    new NodeType("Carbon.TestSite:HtmlFeaturesCodePen"),
    new NodeType("Carbon.TestSite:AfxFeaturesCodePen").optional(),
]) {
    test(`typing ${nodeType}`, async ({ neos }) => {
        await neos.withSharedDocument(async ({document}) => {
            await document.withContentElement(nodeType, async ({contentElement}) => {
                await contentElement.withCodePen(async ({codePen}) => {
                    await codePen.fill("Hello")
                    await codePen.expect("Hello")

                    await codePen.type(" Moin")
                    await codePen.expect("Hello Moin")

                    await codePen.fill("Hey")
                    await codePen.expect("Hey")

                    await codePen.insert(" Grüzi")
                    await codePen.expect("Hey Grüzi")

                    await codePen.insert(" Grüzi")

                    await codePen.clear()
                    await codePen.expectEmpty()
                })
            })
        })
    });
}
