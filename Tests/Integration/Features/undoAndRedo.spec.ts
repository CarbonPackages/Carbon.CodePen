import { test } from "./fixture"

test("undo and redo", async ({ neos }) => {
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

test("undo after closing", async ({ neos }) => {
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

test("redo after closing", async ({ neos }) => {
  test.skip(true, 'If undo stack is empty and applied one cant redo...')
  await neos.withSharedDocument(async ({document}) => {
    await document.withContentElement("Carbon.TestSite:BasicCodePen", async ({contentElement}) => {
      await contentElement.withCodePen(async ({codePen}) => {
        await codePen.fill("firstWord")
        await codePen.undo()
      })
      await contentElement.withCodePen(async ({codePen}) => {
        await codePen.expectEmpty()
        await codePen.redo()
        await codePen.expect("firstWord")
      })
    })
  });
})

test("undo after discarding", async ({ neos }) => {
  await neos.withSharedDocument(async ({document}) => {
    await document.withContentElement("Carbon.TestSite:BasicCodePen", async ({contentElement}) => {
      await contentElement.withCodePen(async ({codePen}) => {
        await codePen.fill("firstWord")
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

test("undo after applying", async ({ neos }) => {
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

test("redo after applying - with no further undos", async ({ neos }) => {
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

test("redo after applying - with at least one undo", async ({ neos }) => {
  await neos.withCleanDocument(async ({document}) => {
    await document.withContentElement("Carbon.TestSite:BasicCodePen", async ({contentElement}) => {
      await contentElement.withCodePen(async ({codePen}) => {
        await codePen.fill("firstWord")
        await codePen.insert(" secondWord")
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

test("undo after switching back from other codepen", async ({ neos }) => {
  await neos.withCleanDocument(async ({document}) => {
    await document.withContentElement("Carbon.TestSite:MultiTabsCodePen", async ({contentElement}) => {
      await contentElement.withCodePen(async ({codePen}) => {
        await codePen.selectTab("Tab A")
        await codePen.fill("firstWord")
        await codePen.fill("secondWord")
      })
      await contentElement.apply()
    })

    await document.withContentElement("Carbon.TestSite:BasicCodePen", async ({contentElement}) => {
      await contentElement.withCodePen(async ({codePen}) => {
        await codePen.fill("thirdWord")
      })
    })

    await document.withExistingContentElement("Carbon.TestSite:MultiTabsCodePen", async ({contentElement}) => {
      await contentElement.withCodePen(async ({codePen}) => {
        await codePen.selectTab("Tab A")
        await codePen.expect("secondWord")
        await codePen.undo()
        await codePen.expect("firstWord")
      })
    })
  })
})

test("undo redo multiple tabs", async ({ neos }) => {
  await neos.withSharedDocument(async ({document}) => {
    await document.withContentElement("Carbon.TestSite:MultiTabsCodePen", async ({contentElement}) => {
      await contentElement.withCodePen(async ({codePen}) => {
        await codePen.selectTab("Tab A")
        await codePen.fill("firstWord")
        await codePen.fill("secondWord")

        await codePen.selectTab("Tab B")
        await codePen.fill("thirdWord")
        await codePen.fill("forthWord")

        await codePen.selectTab("Tab A")
        await codePen.expect("secondWord")
        await codePen.undo()
        await codePen.expect("firstWord")

        await codePen.selectTab("Tab B")
        await codePen.expect("forthWord")
        await codePen.undo()
        await codePen.expect("thirdWord")
      })
    })
  })
})

test("complex undo and redo", async ({ neos }) => {
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

    await document.withExistingContentElement("Carbon.TestSite:MultiTabsCodePen", async ({contentElement}) => {
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

    await document.withExistingContentElement("Carbon.TestSite:BasicCodePen", async ({contentElement}) => {
      await contentElement.withCodePen(async ({codePen}) => {
        await codePen.undo()
        await codePen.expectEmpty()
      })
      await contentElement.apply()
    })
  });
})
