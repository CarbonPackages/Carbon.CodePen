import { test, sleep, configureTest } from "./fixture"

configureTest()

test("undo and redo @new", async ({ neos }) => {
    await neos.withSharedDocument(async ({document}) => {
      await document.withContentElement("Carbon.TestSite:BasicCodePen", async ({contentElement}) => {
        await contentElement.withCodePen(async ({codePen}) => {
          await codePen.fill("firstWord")
          await codePen.undo()
          await codePen.expectEmpty()
          await codePen.redo()
          await codePen.expect("firstWord")
        })
      })
    });
})

test("undo after closing @new", async ({ neos }) => {
  await neos.withSharedDocument(async ({document}) => {
    await document.withContentElement("Carbon.TestSite:BasicCodePen", async ({contentElement}) => {
      await contentElement.withCodePen(async ({codePen}) => {
        await codePen.fill("firstWord")
      })
      await contentElement.withCodePen(async ({codePen}) => {
        await codePen.expect("firstWord")
        await codePen.undo()
        await codePen.expectEmpty()
      })
    })
  });
})



test("undo after discarding @new", async ({ neos }) => {
  test.skip(true, 'Last word is not available in undo stack ...')

  await neos.withSharedDocument(async ({document}) => {
    await document.withContentElement("Carbon.TestSite:BasicCodePen", async ({contentElement}) => {
      await contentElement.withCodePen(async ({codePen}) => {
        await codePen.fill("firstWord")
        await sleep(100)
      })
      await contentElement.discard()
      await contentElement.withCodePen(async ({codePen}) => {
        await codePen.expectEmpty()
        await codePen.undo()
        await codePen.expect("firstWord")
      })
    })
  });
})

test("undo after applying @new", async ({ neos }) => {
  await neos.withCleanDocument(async ({document}) => {
    await document.withContentElement("Carbon.TestSite:BasicCodePen", async ({contentElement}) => {
      await contentElement.withCodePen(async ({codePen}) => {
        await codePen.fill("firstWord")
      })
      await contentElement.apply()
      await contentElement.withCodePen(async ({codePen}) => {
        await codePen.expect("firstWord")
        await codePen.undo()
        await codePen.expectEmpty()
      })
    })
  });
})

test("redo after applying (with no further undos) @new", async ({ neos }) => {
  test.skip(true, 'If undo stack is empty and applied one cant redo...')

  await neos.withCleanDocument(async ({document}) => {
    await document.withContentElement("Carbon.TestSite:BasicCodePen", async ({contentElement}) => {
      await contentElement.withCodePen(async ({codePen}) => {
        await codePen.fill("firstWord")
        await codePen.undo()
        await codePen.expectEmpty()
      })
      await contentElement.apply()
      await contentElement.withCodePen(async ({codePen}) => {
        await codePen.expectEmpty()
        await codePen.redo()
        await codePen.expect("firstWord")
      })
    })
  });
})

test("redo after applying (with at least one undo) @new", async ({ neos }) => {
  await neos.withCleanDocument(async ({document}) => {
    await document.withContentElement("Carbon.TestSite:BasicCodePen", async ({contentElement}) => {
      await contentElement.withCodePen(async ({codePen}) => {
        await codePen.fill("firstWord")
        await codePen.type(" secondWord")
        await codePen.undo()
        await codePen.expect("firstWord")
      })
      await contentElement.apply()
      await contentElement.withCodePen(async ({codePen}) => {
        await codePen.expect("firstWord")
        await codePen.redo()
        await codePen.expect("firstWord secondWord")
      })
    })
  });
})


test("das volle programm @new", async ({ neos }) => {
  test.skip(true, 'If undo stack is empty and applied one cant redo...')

  await neos.withCleanDocument(async ({document}) => {
    await document.withContentElement("Carbon.TestSite:MultiTabsCodePen", async ({contentElement}) => {
      await contentElement.withCodePen(async ({codePen}) => {
        await codePen.selectTab("Tab A")
        await codePen.fill("firstWord")
        await codePen.undo()
        await codePen.expectEmpty()

        await codePen.selectTab("Tab B")
        await codePen.fill("secondWord")
        await codePen.undo()
        await codePen.expectEmpty()

        await codePen.selectTab("Tab A")
        await codePen.redo()
        await codePen.expect("firstWord")
      })
      await contentElement.apply()
    })

    await document.withContentElement("Carbon.TestSite:BasicCodePen", async ({contentElement}) => {
      await contentElement.withCodePen(async ({codePen}) => {
        await codePen.fill("thirdWord")
      })
      await contentElement.apply()
    })

    await document.withContentElement("Carbon.TestSite:MultiTabsCodePen", async ({contentElement}) => {
      await contentElement.withCodePen(async ({codePen}) => {
        await codePen.selectTab("Tab A")
        await codePen.undo()
        await codePen.expect("firstWord")

        await codePen.selectTab("Tab B")
        await codePen.redo()
        await codePen.expect("secondWord")
      })
      await contentElement.apply()
    })

    await document.withContentElement("Carbon.TestSite:BasicCodePen", async ({contentElement}) => {
      await contentElement.withCodePen(async ({codePen}) => {
        await codePen.undo()
        await codePen.expectEmpty()
      })
      await contentElement.apply()
    })
  });
})
