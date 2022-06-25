import { test, expect } from '@playwright/test';
import child_process from "child_process";
import { NeosUiNaviationHelper } from './NeosUiNaviationHelper';

// console.log(await exec("cd TestDistribution && ddev exec './flow flow:cache:flush --force' && ddev exec './deleteAndSetupDb.sh'"));

const exec = (command: string) => {
  return new Promise((resolve, reject) => {
    child_process.exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error.message);
        return;
      }
      if (stderr) {
        reject(stderr);
        return;
      }
      resolve(stdout);
    })
  })
}

// https://github.com/remcohaszing/monaco-yaml/pull/169/files


test.describe.parallel('Open Backend', () => {
  test.use({ storageState: './storage/admin.json' })

  // test.beforeEach(async ({ page }) => {
  //   const neosUi = new NeosUiNaviationHelper(page);
  //   await neosUi.visitSite()
  // });

  // await neosUi.openDocument("Carbon.TestSite:Page (2)");
  // await neosUi.openDocument("1");
  // await (await neosUi.getNodeInContentTree("Carbon.TestSite:BasicCodePen")).nth(1).click();

  test('document 1 live preview behavior', async ({ page }) => {
    const neosUi = new NeosUiNaviationHelper(page);
    await neosUi.vistDocumentInBackend("carbon-test-site-page-1");
    await neosUi.createNodeInCollection("Carbon.TestSite:BasicCodePen");

    await page.locator('text=EditOpen Code Pen').click();

    const secondaryInspector = page.locator(`[class^="style__secondaryInspector"]`)
    const codePenPreview = page.frameLocator('iframe[src^="/neos/codePen"]').locator('body');
    const codePenInput = page.locator('.monaco-editor .inputarea')

    // better way to determing codpen ready
    await expect(codePenPreview).toBeVisible();
    await new Promise(r => setTimeout(r, 1000))


    await expect(secondaryInspector).toHaveScreenshot("beforeEditing.png", { maxDiffPixels: 50 });

    await expect(codePenPreview).toHaveText(`Fusion (Carbon.TestSite:BasicCodePen)null`);

    await codePenInput.fill("Hallo Welt");

    await expect(codePenPreview).toHaveText(`Fusion (Carbon.TestSite:BasicCodePen){"html":"Hallo Welt"}`);

    await expect(secondaryInspector).toHaveScreenshot("afterEditing.png", { maxDiffPixels: 50 });

  })

  test('document 1 live preview behavior dreh', async ({ page }) => {
    const neosUi = new NeosUiNaviationHelper(page);
    await neosUi.vistDocumentInBackend("carbon-test-site-page-1");
    await neosUi.createNodeInCollection("Carbon.TestSite:BasicCodePen");

    await neosUi.openCurrentCodePen();

    await expect(neosUi.codePenPreview.locator("body")).toBeVisible();
    await new Promise(r => setTimeout(r, 1000))

    await neosUi.secondaryInspector.locator("ul>li").first().click()

    await expect(neosUi.secondaryInspector).toHaveScreenshot("afterDrehung.png", { maxDiffPixels: 50 });

    await neosUi.secondaryInspector.locator("ul>li").first().click()

    await expect(neosUi.secondaryInspector).toHaveScreenshot("afterRueckDrehung.png", { maxDiffPixels: 50 });
  })

  test('document 1 emmet', async ({ page }) => {
    const neosUi = new NeosUiNaviationHelper(page);
    await neosUi.vistDocumentInBackend("carbon-test-site-page-1");
    await neosUi.createNodeInCollection("Carbon.TestSite:BasicCodePen");

    await page.locator('text=EditOpen Code Pen').click();

    await new Promise(r => setTimeout(r, 2000))


    await neosUi.codePenInput.type("div", { delay: 100 });
    await neosUi.codePenInput.press('Tab');

    await expect(neosUi.codePenInput).toHaveValue("<div></div>")

    ///////////////////////

    await neosUi.codePenInput.fill("");
    await new Promise(r => setTimeout(r, 500))

    await neosUi.codePenInput.type("<div></div>", { delay: 100 });

    await neosUi.codePenInput.press('ArrowLeft');
    await neosUi.codePenInput.press('ArrowLeft');
    await neosUi.codePenInput.press('ArrowLeft');
    await neosUi.codePenInput.press('ArrowLeft');
    await neosUi.codePenInput.press('ArrowLeft');
    await neosUi.codePenInput.press('ArrowLeft');
    await neosUi.codePenInput.press('ArrowLeft');

    await neosUi.codePenInput.type(" cla", { delay: 100 });
    await neosUi.codePenInput.press('Tab');

    await neosUi.codePenInput.press('Escape');

    await neosUi.codePenInput.type("bg-red-", { delay: 100 });
    await neosUi.codePenInput.press('Tab');

    await expect(neosUi.codePenInput).toHaveValue(`<div class="bg-red-50"></div>`)
  });
});
