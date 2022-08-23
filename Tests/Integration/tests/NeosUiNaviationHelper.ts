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

        await expect(this.page).toHaveTitle('testSite', {
            timeout: 10000
        });
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

    async createOrSetNodeActiveInCollection(nodeNameLabel: string) {
        // try {
        //     await this.getNodeInContentTree(nodeNameLabel).first().click();
        //     return
        // } catch (error) {
        // }
        await this.createNodeInCollection(nodeNameLabel);
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
        await this.page.locator('text=Open CodePen').click();
        await expect(this.codePenPreview.locator("body")).toBeVisible();
        await new Promise(r => setTimeout(r, 1000))
    }

    async discardCurrentCodePen() {
        await this.page.locator('button[role="button"]:has-text("Discard")').click();
    }

    async openCodPenTab(label: string) {
        await this.secondaryInspector.locator(`text=${label}`).click()
        await new Promise(r => setTimeout(r, 100))
    }

    async expectCodePenEditorInputToHaveScreenshot(name: string) {
        // we make it fullscreen so we dont test the minimap and so on in this test
        await this.expectLocatorToHaveScreenshot(name, this.codePenEditor.locator(".view-lines"))
    }

    async expectCodePenPreviewToHaveScreenshot(name: string) {
        await this.expectLocatorToHaveScreenshot(name, this.secondaryInspector.locator('iframe[src^="/neos/codePen"]'))
    }

    async expectLocatorToHaveScreenshot(name: string, locator: Locator) {
        await locator.evaluate((el) => el.requestFullscreen())
        await expect(this.page).toHaveScreenshot(name, { maxDiffPixels: 50 });
        await this.page.locator("body").evaluate((el) => el.ownerDocument.exitFullscreen())
    }

    get secondaryInspector() {
        return this.page.locator(`[class^="style__secondaryInspector"]`)
    }

    get codePenEditor() {
        return this.secondaryInspector.locator('.monaco-editor[role="code"]')
    }

    get codePenInput() {
        return this.codePenEditor.locator('.inputarea')
    }

    get codePenPreview() {
        return this.secondaryInspector.frameLocator('iframe[src^="/neos/codePen"]');
    }
}
