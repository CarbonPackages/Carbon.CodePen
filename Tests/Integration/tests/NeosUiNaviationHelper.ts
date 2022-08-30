import { expect, Locator, Page } from "@playwright/test";
import { sleep } from "./fixture";

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

class CodePen {
    constructor(private page: Page) {
    }

    async type(text: string, milliseconds: number = 0) {
        const prevText = await this.codePenInput.inputValue();
        await this.codePenInput.type(text, { delay: milliseconds });
        await this.expect(prevText + text)
    }

    async fill(text: string) {
        await this.codePenInput.fill(text);
        await this.expect(text)
    }

    async undo() {
        await this.codePenInput.press('Control+Z');
    }

    async redo() {
        await this.codePenInput.press('Control+Shift+Z');
    }

    async expect(text: string) {
        await expect(this.codePenInput).toHaveValue(text)
    }

    async expectEmpty() {
        await this.expect("")
    }

    async selectTab(label: string) {
        await this.secondaryInspector.locator(`text=${label}`).click()
        await new Promise(r => setTimeout(r, 100))
    }

    async expectInputToHaveScreenshot(name: string) {
        // we make it fullscreen so we dont test the minimap and so on in this test
        await this.expectLocatorToHaveScreenshot(name, this.codePenEditor.locator(".view-lines"))
    }

    async expectPreviewToHaveScreenshot(name: string) {
        await this.expectLocatorToHaveScreenshot(name, this.secondaryInspector.locator('iframe[src^="/neos/codePen"]'))
    }

    private async expectLocatorToHaveScreenshot(name: string, locator: Locator) {
        await locator.evaluate((el) => el.requestFullscreen())
        await expect(this.page).toHaveScreenshot(name, { maxDiffPixels: 50 });
        await this.page.evaluate(() => document.exitFullscreen())
    }

    private get secondaryInspector() {
        return this.page.locator(`[class^="style__secondaryInspector"]`)
    }

    private get codePenEditor() {
        return this.secondaryInspector.locator('.monaco-editor[role="code"]')
    }

    private get codePenInput() {
        return this.codePenEditor.locator('.inputarea')
    }

    private get codePenPreview() {
        return this.secondaryInspector.frameLocator('iframe[src^="/neos/codePen"]');
    }
}


class ContentElement {

    private codePenWasOpenedOnce: boolean;

    constructor(private page: Page, private contentMutationAllowed: boolean, private codePenState: { isInitialized: boolean }) {
    }

    async apply() {
        if (!this.contentMutationAllowed) {
            throw new Error("Cannot apply changes, as content mutations are not allowed.");
        }
        await this.page.click('#neos-Inspector-Apply');
        await new Promise(r => setTimeout(r, 1000))
    }

    async discard() {
        await this.page.click('#neos-Inspector-Discard');
        await new Promise(r => setTimeout(r, 1000))
    }

    async withCodePen(callback: ((args: {codePen: CodePen}) => Promise<void>)) {
        await this.page.click('text=Open CodePen');


        // await sleep(1000);

        // await waitForDomEvent(this.codePenPreview, "load", {timeout: 10000})



        // console.log("a");

       //  const lol = waitForDomEvent(this.codePenPreview, "load", {timeout: 10000});

        await this.codePenPreview.waitFor()

        if (!this.codePenState.isInitialized) {
            this.codePenState.isInitialized = true;
            await sleep(1000)
        }


        // console.log("b");
        // await expect(this.codePenPreviewFrame.locator("body")).toBeVisible();

        await callback({codePen: new CodePen(this.page)})

        // auto close
        if (await this.codePenEditor.count() !== 0) {
            await this.page.click('text=Open CodePen')
            await new Promise(r => setTimeout(r, 100))
        }
    }

    private get codePenPreviewFrame() {
        return this.secondaryInspector.frameLocator('iframe[src^="/neos/codePen"]');
    }

    private get codePenPreview() {
        return this.secondaryInspector.locator('iframe[src^="/neos/codePen"]');
    }

    private get secondaryInspector() {
        return this.page.locator(`[class^="style__secondaryInspector"]`)
    }

    private get codePenEditor() {
        return this.secondaryInspector.locator('.monaco-editor[role="code"]')
    }
}

type ContentElementCallback = ((args: {contentElement: ContentElement}) => Promise<void>);
type DocumentCallback = ((args: {document: Document}) => Promise<void>);


class Document {

    private codePenState: { isInitialized: boolean } = { isInitialized: false };

    constructor(private page: Page, private contentMutationAllowed: boolean) {
    }

    private async discardPendingChanges() {
        if (await this.page.isEnabled('#neos-Inspector-Discard')) {
            await this.page.click('#neos-Inspector-Discard')
        }
    }

    async withNewContentElement(nodeTypeName: string, callback: ContentElementCallback) {
        await this.createNodeInCollection(nodeTypeName)
        await callback({contentElement: new ContentElement(this.page, this.contentMutationAllowed, this.codePenState)})
        await this.discardPendingChanges()
    }

    async withContentElement(nodeNameLabel: string, callback: ContentElementCallback) {        
        if (await this.getNodeInContentTree(nodeNameLabel).count() > 0) {
            await this.getNodeInContentTree(nodeNameLabel).first().click();
        } else {
            await this.createNodeInCollection(nodeNameLabel);
        }
        await callback({contentElement: new ContentElement(this.page, this.contentMutationAllowed, this.codePenState)})
        await this.discardPendingChanges()
    }

    private async createNodeInCollection(nodeNameLabel: string) {
        await (await this.getNodeInContentTree("Content Collection (main)")).first().click()
        await this.page.click('#neos-ContentTree-AddNode');
        await this.page.click(`#neos-SelectNodeTypeDialog button[role="button"]:has-text(${JSON.stringify(nodeNameLabel)})`);
        return
    }

    private getNodeInContentTree(nodeNameLabel: string): Locator {
        return this.page.locator(`[class^="style__leftSideBar__bottom"] div[role="button"]:has-text(${JSON.stringify(nodeNameLabel)})`);
    }
}



export class NeosUiNaviationHelper {
    constructor(private page: Page) {
    }

    gotoDocumentInBackend(documentTitle: string) {
        const contextPath = `/sites/testsite/${documentTitle}@user-admin`
        return this.page.goto(`${NEOS_SITE}/neos/content?node=${encodeURIComponent(contextPath)}`);
    }

    gotoHomePageInBackend() {
        const contextPath = `/sites/testsite@user-admin`
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
        await this.gotoHomePageInBackend()

        await this.page.click('#neos-ContentTree-AddNode');
        await this.page.click(`#neos-SelectNodeTypeDialog button[role="button"]:has-text("${nodeTypeName}")`);
    
        await this.page.fill(`#__neos__editor__property---title--creation-dialog`, title);
        await this.page.click(`#neos-NodeCreationDialog-CreateNew`);
        
        await this.waitForIframe();        
    }

    async withCleanDocument(callback: DocumentCallback) {
        let newDocumentName = `carbon-test-site-page-${Math.round(Math.random() * 100000)}`
        await this.createDocumentAndSelect("Carbon.TestSite:Page", newDocumentName);
        await callback({ document: new Document(this.page, true)})
    }

    useCleanDocument() {
        let newDocumentName = `carbon-test-site-page-${Math.round(Math.random() * 100000)}`
        return this.createDocumentAndSelect("Carbon.TestSite:Page", newDocumentName);
    }

    async withSharedDocument(callback: DocumentCallback) {
        await this.gotoDocumentInBackend("carbon-test-site-page-1");
        await sleep(1000)
        await callback({ document: new Document(this.page, false) })
    }

    async useSharedDocument() {
        await this.gotoDocumentInBackend("carbon-test-site-page-1");
        await sleep(1000)
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

        // await this.codePenEditor.waitFor()

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
