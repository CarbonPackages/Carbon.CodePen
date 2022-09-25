import { sleep, test } from "./fixture"

test('session expires and relogin is possible', async ({ neos }) => {
    await neos.changeAccountAndDestroySession({
        username: "admin2",
        password: "admin2"
    })

    await neos.withFlowSubContext("SessionExpired", async () => {
        await neos.gotoBackendAndLogin();
        await neos.withSharedDocument(async ({document}) => {
            await document.withContentElement("Carbon.TestSite:BasicCodePen", async ({contentElement}) => {
                await contentElement.withCodePen(async ({codePen}) => {
                    await codePen.expectPreview(`Fusion (Carbon.TestSite:BasicCodePen)null`)
                    await codePen.fill("Hallo Welt")
                    await codePen.expectPreview(`Fusion (Carbon.TestSite:BasicCodePen){"html":"Hallo Welt"}`)
    
                    await sleep(2100)
    
                    await codePen.type("Moin")
                    await neos.expectSessionToBeTimedOut()
                    // codepen window auto closes, when relogin dialog is shown
                })
    
                await neos.reloginAfterTimedOutSession();

                await contentElement.withCodePen(async ({codePen}) => {
                    await sleep(100)
                    await codePen.expectPreview(`Fusion (Carbon.TestSite:BasicCodePen){"html":"Hallo WeltMoin"}`)
    
                    await codePen.fill("Moin")
                    await codePen.expectPreview(`Fusion (Carbon.TestSite:BasicCodePen){"html":"Moin"}`)
                })
    
            })
        })
        
    })

    await neos.dangerouslyRemoveConsoleMessagesThatAreNoErrors();
})
