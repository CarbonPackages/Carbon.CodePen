import { expect, Locator, Page } from "@playwright/test";

const NEOS_SITE = 'https://carboncodepentestdistribution.ddev.site';

export class NeosUiNaviationHelper {
    constructor(private page: Page) {
    }

    vistDocumentInBackend(documentNodeName: string) {
        const contextPath = `/sites/testsite/${documentNodeName}@user-admin`
        return this.page.goto(`${NEOS_SITE}/neos/content?node=${encodeURIComponent(contextPath)}`);
    }

    visitSite() {
        return this.page.goto(`${NEOS_SITE}/neos`);
    }

    async visit() {
        await this.visitSite()

        await expect(this.page).toHaveTitle('Login to testSite');

        await this.page.locator('#username').fill('admin');
        await this.page.locator('#password').fill('admin');

        await Promise.all([
            this.page.waitForNavigation(),
            this.page.locator('button:has-text("Login")').click()
        ]);

        await expect(this.page).toHaveTitle('testSite');
        await expect(this.page.locator('button:has-text("Document Tree")')).toBeTruthy();
    }

    getNodeInContentTree(nodeNameLabel: string): Locator {
        return this.page.locator(`[class^="style__leftSideBar__bottom"] div[role="button"]:has-text(${JSON.stringify(nodeNameLabel)})`);
    }

    openContentTree() {
        return this.page.locator('[class^="style__leftSideBar__bottom"] div[role="button"]:has-text("Content Tree")').click();
    }

    openDocument(documentLabel: string) {
        return Promise.all([
            this.page.waitForNavigation(),
            this.page.locator(`[class^="style__leftSideBar__top"] div[role="button"]:has-text(${JSON.stringify(documentLabel)})`).click()
        ]);
    }

    // getNeosContentFrame = () => this.page.frameLocator('iframe[name="neos-content-main"]');

    // getContentCollectionInline = () => this.getNeosContentFrame().locator('.neos-contentcollection').first()

    async createNodeInCollection(nodeNameLabel: string) {
        await (await this.getNodeInContentTree("Content Collection (main)")).first().click()
        await this.page.locator('#neos-ContentTree-AddNode').click();
        await this.page.locator(`#neos-SelectNodeTypeDialog button[role="button"]:has-text(${JSON.stringify(nodeNameLabel)})`).click();
        return
    }

    async openCurrentCodePen() {
        return this.page.locator('text=EditOpen Code Pen').click();
    }


    get secondaryInspector() {
        return this.page.locator(`[class^="style__secondaryInspector"]`)
    }


    get codePenInput() {
        return this.page.locator('.monaco-editor .inputarea')
    }

    get codePenPreview() {
        return this.page.frameLocator('iframe[src^="/neos/codePen"]');
    }
}
