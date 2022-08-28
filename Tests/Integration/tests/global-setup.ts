import { Browser, chromium, FullConfig, expect } from '@playwright/test'
import { NeosUiNaviationHelper } from './NeosUiNaviationHelper'

import child_process from "child_process";

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

async function globalSetup(config: FullConfig) {

    // console.log(await exec("cd TestDistribution && ddev exec './flow flow:cache:flush --force' && ddev exec './deleteAndSetupDb.sh'"));
    console.log(await exec("pnpm run softResetNeos"));

    const browser = await chromium.launch()
    await saveStorage(browser, 'tmpSharedNeosTestSession.json')
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