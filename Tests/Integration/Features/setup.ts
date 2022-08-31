import { chromium, FullConfig, Page } from '@playwright/test'
import { Neos } from './fixture'

// @ts-expect-error
import child_process from "child_process";

import { sleep } from './fixture';

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

export default async function globalSetup(config: FullConfig) {    

    // console.log(await exec("cd TestDistribution && ddev exec './flow flow:cache:flush --force' && ddev exec './deleteAndSetupDb.sh'"));
    // console.log(await exec("pnpm run softResetNeos"));

    const browser = await chromium.launch()

    const { baseURL } = config.projects[0].use;
    const page = await browser.newPage({baseURL});

    await saveStorage(page, 'tmpSharedNeosTestSession.json')
    await browser.close()
}

async function saveStorage(page: Page, saveStoragePath: string) {
    const neos = new Neos(page);
    await neos.gotoBackendAndLogin();

    // this state change will be saved in local storage ...
    await neos.openContentTree();

    // wait until state is saved in local storage
    // pi mal daumen
    await sleep(500)

    await page.context().storageState({ path: saveStoragePath })
}
