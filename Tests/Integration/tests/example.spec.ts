import { test, expect, Page } from '@playwright/test';
import { NeosUiNaviationHelper } from './NeosUiNaviationHelper';

// console.log(await exec("cd TestDistribution && ddev exec './flow flow:cache:flush --force' && ddev exec './deleteAndSetupDb.sh'"));

test.describe.configure({ mode: 'parallel' });


test.use({ storageState: './storage/admin.json' })

test.describe("Language Features HTML,AFX,YAML", () => {
  const testSyntaxHighlightinWithScreenShot = async (page: Page, nodeTypeToBeUsed: string, code: string, fileName: string): Promise<void> => {
    const neosUi = new NeosUiNaviationHelper(page);
    await neosUi.vistDocumentInBackend("carbon-test-site-page-1");
    await neosUi.createOrSetNodeActiveInCollection(nodeTypeToBeUsed);

    await neosUi.openCurrentCodePen();
    await neosUi.codePenInput.fill(code);

    await neosUi.expectCodePenEditorInputToHaveScreenshot(fileName)
  }

  test("HTML Syntax-Highlighting", async ({ page }) => {

    const code = `<div>Foo Bar</div>
<div class="wieso baum">
</div>
<p>Darum</p>
`
    await testSyntaxHighlightinWithScreenShot(page, "Carbon.TestSite:HtmlFeaturesCodePen", code, "htmlSyntax.png");
  })

  test("AFX Syntax-Highlighting", async ({ page }) => {
    const code = `<div>Foo Bar</div>
<div class="wieso baum">
</div>
<Neos.Fusion:Tag a="b">
</Neos.Fusion:Tag>
`;
    await testSyntaxHighlightinWithScreenShot(page, "Carbon.TestSite:AfxFeaturesCodePen", code, "afxSyntax.png");
  })

  test("YAML Syntax-Highlighting", async ({ page }) => {
    const code = `Foo: "Bar"
wiesoBaum: Darum
jetzt: "aber raus hier"
`;

    await testSyntaxHighlightinWithScreenShot(page, "Carbon.TestSite:YamlFeaturesCodePen", code, "yamlSyntax.png");
  })
})





const testCompletionForTab = async (neosUi: NeosUiNaviationHelper, tabLabel: string, triggerChars: string, fullCompletion: string) => {
  await neosUi.openCodPenTab(tabLabel);
  await neosUi.codePenInput.type(triggerChars, { delay: 100 })
  await neosUi.codePenInput.press('Control+ ');
  await new Promise(r => setTimeout(r, 100));

  expect(await neosUi.secondaryInspector.locator(`text=${fullCompletion}`).count()).toBe(1)

  expect(await neosUi.secondaryInspector.locator(`text=xxx`).count()).toBe(2)

  await neosUi.codePenInput.press('Tab');

  await expect(neosUi.codePenInput).toHaveValue(fullCompletion)

  await neosUi.codePenInput.fill("");
}

test('custom completion', async ({ page }) => {
  const neosUi = new NeosUiNaviationHelper(page);
  await neosUi.vistDocumentInBackend("carbon-test-site-page-1");
  await neosUi.createOrSetNodeActiveInCollection("Carbon.TestSite:CustomCompletionCodePen");
  await neosUi.openCurrentCodePen();

  await testCompletionForTab(neosUi, "Tab A", "xxx", "xxxCompletion1TabA");

  await testCompletionForTab(neosUi, "Tab B", "xxx", "xxxCompletion1TabB");

  await testCompletionForTab(neosUi, "Tab C", "xxx", "xxxCompletion1TabC");

  await testCompletionForTab(neosUi, "Tab A", "xxx", "xxxCompletion1TabA");

  await neosUi.discardCurrentCodePen();

  await neosUi.createOrSetNodeActiveInCollection("Carbon.TestSite:CustomCompletionCodePen");
  await neosUi.openCurrentCodePen();

  await testCompletionForTab(neosUi, "Tab A", "xxx", "xxxCompletion1TabA");
})

test('document 1 live preview behavior', async ({ page }) => {
  const neosUi = new NeosUiNaviationHelper(page);
  await neosUi.vistDocumentInBackend("carbon-test-site-page-1");
  await neosUi.createOrSetNodeActiveInCollection("Carbon.TestSite:BasicCodePen");

  await neosUi.openCurrentCodePen();

  await expect(neosUi.secondaryInspector).toHaveScreenshot("beforeEditing.png", { maxDiffPixels: 50 });

  await expect(neosUi.codePenPreview.locator("body")).toHaveText(`Fusion (Carbon.TestSite:BasicCodePen)null`);

  await neosUi.codePenInput.fill("Hallo Welt");

  await expect(neosUi.codePenPreview.locator("body")).toHaveText(`Fusion (Carbon.TestSite:BasicCodePen){"html":"Hallo Welt"}`);

  await expect(neosUi.secondaryInspector).toHaveScreenshot("afterEditing.png", { maxDiffPixels: 50 });

})

test('document 1 live preview behavior dreh', async ({ page }) => {
  const neosUi = new NeosUiNaviationHelper(page);
  await neosUi.vistDocumentInBackend("carbon-test-site-page-1");
  await neosUi.createOrSetNodeActiveInCollection("Carbon.TestSite:BasicCodePen");

  await neosUi.openCurrentCodePen();

  await expect(neosUi.codePenPreview.locator("body")).toBeVisible();
  await new Promise(r => setTimeout(r, 1000))

  await neosUi.secondaryInspector.locator("ul>li").first().click()

  await expect(neosUi.secondaryInspector).toHaveScreenshot("afterDrehung.png", { maxDiffPixels: 50 });

  await neosUi.secondaryInspector.locator("ul>li").first().click()

  await expect(neosUi.secondaryInspector).toHaveScreenshot("afterRueckDrehung.png", { maxDiffPixels: 50 });
})



test("afxTagCompletion", async ({ page }) => {
  const neosUi = new NeosUiNaviationHelper(page);
  await neosUi.vistDocumentInBackend("carbon-test-site-page-1");
  await neosUi.createOrSetNodeActiveInCollection("Carbon.TestSite:AfxFeaturesCodePen");
  await neosUi.openCurrentCodePen();

  await neosUi.codePenInput.type("Loop", { delay: 100 });
  await neosUi.codePenInput.press('Tab');

  await neosUi.codePenInput.type("itemsValue", { delay: 100 });

  await neosUi.codePenInput.press('Tab');
  await neosUi.codePenInput.type("content", { delay: 100 });

  await expect(neosUi.codePenInput).toHaveValue(`<Neos.Fusion:Loop items={itemsValue}>
  content
</Neos.Fusion:Loop>
`)
})


test("afxTagHover", async ({ page }) => {
  const neosUi = new NeosUiNaviationHelper(page);
  await neosUi.vistDocumentInBackend("carbon-test-site-page-1");
  await neosUi.createOrSetNodeActiveInCollection("Carbon.TestSite:AfxFeaturesCodePen");
  await neosUi.openCurrentCodePen();

  await neosUi.codePenInput.fill("<Neos.Fusion:Loop />");

  expect(await neosUi.codePenEditor.locator("text=Render each item in").count()).toBe(0);

  await neosUi.codePenEditor.locator("text=Loop").hover({ force: true })
  await new Promise(r => setTimeout(r, 500))

  expect(await neosUi.codePenEditor.locator("text=Render each item in").count()).toBe(1);

  await expect(neosUi.codePenEditor.locator("text=Render each item in")).toBeVisible();
})


test("tailwind css", async ({ page }) => {
  const neosUi = new NeosUiNaviationHelper(page);
  await neosUi.vistDocumentInBackend("carbon-test-site-page-1");
  await neosUi.createOrSetNodeActiveInCollection("Carbon.TestSite:TailwindCodePen");

  await neosUi.openCurrentCodePen();

  await neosUi.codePenInput.type(`<div class="`, { delay: 50 });

  await neosUi.codePenInput.press('Escape');

  await neosUi.codePenInput.type(`bg-red-8`, { delay: 50 });

  await expect(neosUi.codePenEditor.locator("text=bg-red-800")).toBeVisible();

  await neosUi.codePenInput.press('Tab');

  await neosUi.codePenInput.press('ArrowRight');

  await neosUi.codePenInput.type(`>Moin</div>`, { delay: 50 });

  await expect(neosUi.codePenInput).toHaveValue(`<div class="bg-red-800">Moin</div>`)

  await neosUi.expectCodePenEditorInputToHaveScreenshot('tailwindSyntax.png')

  await neosUi.expectCodePenPreviewToHaveScreenshot('tailwindPreview.png')
})

test('document 1 emmet', async ({ page }) => {
  const neosUi = new NeosUiNaviationHelper(page);
  await neosUi.vistDocumentInBackend("carbon-test-site-page-1");
  await neosUi.createOrSetNodeActiveInCollection("Carbon.TestSite:HtmlFeaturesCodePen");

  await neosUi.openCurrentCodePen();

  await neosUi.codePenInput.type("div", { delay: 100 });
  await neosUi.codePenInput.press('Tab');

  await expect(neosUi.codePenInput).toHaveValue("<div></div>")
});
