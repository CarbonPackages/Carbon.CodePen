import { Page, expect, Locator } from "@playwright/test";
import { waitForDomEvent } from "./waitForDomEvent";
import { Document } from "./Document";

type DocumentCallback = ((args: {document: Document}) => Promise<void>);

export class Neos {
    private consoleMessages: string [] = [];

    public constructor(private page: Page) {
    }

    public async initializeObject() {
        this.page.on('console', (message) => {
            if (message.type() === "info" && message.text() === "1 change successfully applied.") {
                return;
            }
            if (message.type() === "info" && message.text().startsWith("Slow network is detected.")) {
                return;
            }
            this.consoleMessages.push(`[${message.type()}] ${message.text()}`)
        });
    }

    public async shutdownObject() {
        expect(this.consoleMessages).toStrictEqual([]);
    }

    public async withCleanDocument(callback: DocumentCallback) {
        let newDocumentName = `carbon-test-site-page-${Math.round(Math.random() * 100000)}`
        await this.createDocumentAndSelect("Carbon.TestSite:Page", newDocumentName);
        await callback({ document: new Document(this.page, true)})
    }

    public async withCleanDocumentInContext(context: "TailwindJson", callback: DocumentCallback) {
        await this.page.setExtraHTTPHeaders({ 'FLOWSUBCONTEXT': context })
        await this.withCleanDocument(callback)
        await this.page.setExtraHTTPHeaders({})
    }

    public async withSharedDocument(callback: DocumentCallback) {
        await this.gotoDocumentInBackend("carbon-test-site-page-1");
        await callback({ document: new Document(this.page, false) })
    }

    public async gotoBackendAndLogin() {
        await this.page.goto(`/neos`);

        await expect(this.page).toHaveTitle(/Login to .*/);

        await this.page.fill('#username', 'admin');
        await this.page.fill('#password', 'admin');

        await Promise.all([
            this.page.waitForNavigation(),
            this.page.click('button:has-text("Login")')
        ])

        await waitForDomEvent(this.page.locator(`iframe[name=neos-content-main]`), "load", {timeout: 10000})
    }

    public async openContentTree() {
        await this.page.click('[class^="style__leftSideBar__bottom"] div[role="button"]:has-text("Content Tree")');
        await expect(this.getNodeInContentTree("Content Collection (main)")).toBeVisible();
    }

    private getNodeInContentTree(nodeNameLabel: string): Locator {
        return this.page.locator(`[class^="style__leftSideBar__bottom"] div[role="button"]:has-text(${JSON.stringify(nodeNameLabel)})`);
    }

    private async gotoDocumentInBackend(documentTitle: string) {
        const contextPath = `/sites/testsite/${documentTitle}@user-admin`
        await this.page.goto(`/neos/content?node=${encodeURIComponent(contextPath)}`);
        await this.waitForIframe()
    }

    private async gotoHomePageInBackend() {
        const contextPath = `/sites/testsite@user-admin`
        await this.page.goto(`/neos/content?node=${encodeURIComponent(contextPath)}`);
        await this.waitForIframe()
    }

    private async gotoBackend() {
        await this.page.goto(`/neos`);
        await this.waitForIframe()
    }

    private waitForIframe() {
        return waitForDomEvent(this.page.locator(`iframe[name=neos-content-main]`), "load")
    }

    private openDocument(documentLabel: string) {
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
}
