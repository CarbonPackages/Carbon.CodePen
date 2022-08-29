import { expect, Locator, Page } from "@playwright/test";

const NEOS_SITE = 'https://carboncodepentestdistribution.ddev.site';

/**
 * @example waitForDomEvent(page.locator(`iframe`), "load")
 */
const waitForDomEvent = (locator: Locator, eventName: keyof HTMLElementEventMap, options?: {timeout?: number}) => {
    return locator.evaluate((element, serializedEventName) => {
        return new Promise<void>((resolve) => {
            element.addEventListener(serializedEventName, () => resolve(), {once: true})
        })
    }, eventName, options);
}

export class NeosUiNaviationHelper {
    constructor(private page: Page) {
    }

    gotoDocumentInBackend(documentTitle: string) {
        const contextPath = `/sites/testsite/${documentTitle}@user-admin`
        return this.page.goto(`${NEOS_SITE}/neos/content?node=${encodeURIComponent(contextPath)}`);
    }

    async gotoBackend() {
        await this.page.goto(`${NEOS_SITE}/neos`);
        await this.waitForIframe()
    }

    waitForIframe() {
        return waitForDomEvent(this.page.locator(`iframe[name=neos-content-main]`), "load")
    }

    async gotoBackendAndLogin() {
        await this.page.goto(`${NEOS_SITE}/neos`);

        await expect(this.page).toHaveTitle(/Login to .*/);

        await this.page.fill('#username', 'admin');
        await this.page.fill('#password', 'admin');

        await Promise.all([
            this.page.waitForNavigation(),
            this.page.click('button:has-text("Login")')
        ])

        await waitForDomEvent(this.page.locator(`iframe[name=neos-content-main]`), "load", {timeout: 10000})
    }

    getNodeInContentTree(nodeNameLabel: string): Locator {
        return this.page.locator(`[class^="style__leftSideBar__bottom"] div[role="button"]:has-text(${JSON.stringify(nodeNameLabel)})`);
    }

    openContentTree() {
        return this.page.click('[class^="style__leftSideBar__bottom"] div[role="button"]:has-text("Content Tree")');
    }

    openDocument(documentLabel: string) {
        return Promise.all([
            this.page.waitForNavigation(),
            this.page.click(`[class^="style__leftSideBar__top"] div[role="button"]:has-text(${JSON.stringify(documentLabel)})`)
        ]);
    }

    private async createDocumentAndSelect(nodeTypeName: string, title: string) {
        await this.openDocument('testSite');

        await this.page.click('#neos-ContentTree-AddNode');
        await this.page.click(`#neos-SelectNodeTypeDialog button[role="button"]:has-text("${nodeTypeName}")`);
    
        await this.page.fill(`#__neos__editor__property---title--creation-dialog`, title);
        await this.page.click(`#neos-NodeCreationDialog-CreateNew`);
        
        await this.waitForIframe();        
    }

    async useCleanDocument() {
        let newDocumentName = `carbon-test-site-page-${Math.round(Math.random() * 100000)}`

        await this.createDocumentAndSelect("Carbon.TestSite:Page", newDocumentName);
    }

    async createOrSetNodeActiveInCollection(nodeNameLabel: string) {        
        if (await this.getNodeInContentTree(nodeNameLabel).count() > 0) {
            await this.getNodeInContentTree(nodeNameLabel).first().click();
            return
        }

        await this.createNodeInCollection(nodeNameLabel);
    }

    // getNeosContentFrame = () => this.page.frameLocator('iframe[name="neos-content-main"]');

    // getContentCollectionInline = () => this.getNeosContentFrame().locator('.neos-contentcollection').first()

    async createNodeInCollection(nodeNameLabel: string) {
        await (await this.getNodeInContentTree("Content Collection (main)")).first().click()
        await this.page.click('#neos-ContentTree-AddNode');
        await this.page.click(`#neos-SelectNodeTypeDialog button[role="button"]:has-text(${JSON.stringify(nodeNameLabel)})`);
        return
    }

    async openCurrentCodePen() {
        await this.page.click('text=Open CodePen');
        await expect(this.codePenPreview.locator("body")).toBeVisible();
        await new Promise(r => setTimeout(r, 1000))
    }

    async discardCurrentCodePen() {
        await this.page.click('button[role="button"]:has-text("Discard")');
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
