import { chromium, FullConfig, Page } from '@playwright/test'
import { Neos } from './fixture'
import { sleep } from './fixture';

export default async function globalSetup(config: FullConfig) {    
    const browser = await chromium.launch()

    const { baseURL } = config.projects[0].use;
    const page = await browser.newPage({baseURL});

    await saveStorage(page, 'tmpSharedNeosTestSession.json')
    await browser.close()
}

async function saveStorage(page: Page, saveStoragePath: string) {
    const neos = new Neos(page, {
        username: "admin",
        password: "admin"
    });
    await neos.initializeObject();
    await neos.gotoBackendAndLogin();

    // this state change will be saved in local storage ...
    await neos.openContentTree();

    await neos.shutdownObject();

    // wait until state is saved in local storage
    // pi mal daumen
    await sleep(500)

    await page.context().storageState({ path: saveStoragePath })
}
