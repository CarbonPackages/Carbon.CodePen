import { Browser, chromium, FullConfig, expect } from '@playwright/test'
import { NeosUiNaviationHelper } from './NeosUiNaviationHelper'

async function globalSetup(config: FullConfig) {
    const browser = await chromium.launch()
    await saveStorage(browser, 'storage/admin.json')
    await browser.close()
}

async function saveStorage(browser: Browser, saveStoragePath: string) {
    const page = await browser.newPage();

    const neosUi = new NeosUiNaviationHelper(page);
    await neosUi.visit();
    await neosUi.openContentTree();
    await expect(neosUi.getNodeInContentTree("Content Collection (main)")).toBeVisible();

    // wait until state is saved in local storage
    await new Promise(r => setTimeout(r, 500))

    await page.context().storageState({ path: saveStoragePath })
}

export default globalSetup;