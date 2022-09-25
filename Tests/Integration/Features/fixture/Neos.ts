import { Page, expect, Locator, ConsoleMessage } from "@playwright/test";
import { waitForDomEvent } from "./waitForDomEvent";
import { Document } from "./Document";

type DocumentCallback = ((args: {document: Document}) => Promise<void>);

type Account = { username: string, password: string };

export class Neos {
    private consoleMessages: ConsoleMessage [] = [];

    constructor(private page: Page, private account: Account) {
    }

    async initializeObject() {
        this.page.on('console', (message) => {
            if (message.type() === "info" && message.text() === "1 change successfully applied.") {
                return;
            }
            if (message.type() === "info" && message.text().startsWith("Slow network is detected.")) {
                return;
            }
            if (message.type() === "warning" && message.text().startsWith("Something went wrong with requesting additional node metadata")) {
                return;
            }
            if (message.type() === "warning" && message.text() === "Without `from` option PostCSS could generate wrong source map and will not find Browserslist config. Set it to CSS file path or to `undefined` to prevent this warning.") {
                return;
            }
            this.consoleMessages.push(message)
        });
    }

    async shutdownObject() {
        expect(this.consoleMessages.map((message) => `[${message.type()}] ${message.text()}`)).toStrictEqual([]);
    }

    async dangerouslyRemoveConsoleMessagesThatAreNoErrors() {
        if (this.consoleMessages.some((message) => message.type() === "error")) {
            return
        }
        this.consoleMessages = this.consoleMessages.filter((message) => message.type() === "error")
    }

    async changeAccountAndDestroySession(account: Account) {
        await this.page.context().clearCookies(),
        this.account = account;
    }

    async expectSessionToBeTimedOut() {
        await expect(this.page.locator(`#neos-ReloginDialog >> text="Your login has expired. Please log in again."`)).toBeVisible()
    }

    async reloginAfterTimedOutSession() {
        await this.page.locator(`#neos-ReloginDialog [placeholder="Username"]`).fill("admin2")
        await this.page.locator(`#neos-ReloginDialog [placeholder="Password"]`).fill("admin2")
        await this.page.locator(`#neos-ReloginDialog >> button >> text="Login"`).click()
    }

    async withFlowSubContext(context: "TailwindJson" | "SessionExpired", callback: () => Promise<void>) {
        await this.page.setExtraHTTPHeaders({ 'FLOWSUBCONTEXT': context })
        await callback();
        await this.page.setExtraHTTPHeaders({})
    }

    async withCleanDocument(callback: DocumentCallback) {
        let newDocumentName = `carbon-test-site-page-${Math.round(Math.random() * 100000)}`
        await this.createDocumentAndSelect("Carbon.TestSite:Page", newDocumentName);
        await callback({ document: new Document(this.page, true)})
    }

    async withSharedDocument(callback: DocumentCallback) {
        await this.gotoDocumentInBackend("carbon-test-site-page-1");
        await callback({ document: new Document(this.page, false) })
    }

    async gotoBackendAndLogin() {
        await this.page.goto(`/neos`);

        try {
            await expect(this.page).toHaveTitle(/Login to .*/, { timeout: 500 })
        } catch (error) {
            await this.page.reload();
        } finally {
            await expect(this.page).toHaveTitle(/Login to .*/);
        }

        await this.page.fill('#username', this.account.username);
        await this.page.fill('#password', this.account.password);

        await Promise.all([
            this.page.waitForNavigation(),
            this.page.click('button:has-text("Login")')
        ])
        await this.waitForIframe(10000)
    }

    async openContentTree() {
        await this.page.click('[class^="style__leftSideBar__bottom"] div[role="button"]:has-text("Content Tree")');
        await expect(this.getNodeInContentTree("Content Collection (main)")).toBeVisible();
    }

    private getNodeInContentTree(nodeNameLabel: string): Locator {
        return this.page.locator(`[class^="style__leftSideBar__bottom"] div[role="button"]:has-text(${JSON.stringify(nodeNameLabel)})`);
    }

    private async gotoDocumentInBackend(documentTitle: string) {
        const contextPath = `/sites/testsite/${documentTitle}@user-${this.account.username}`
        await this.page.goto(`/neos/content?node=${encodeURIComponent(contextPath)}`);
        await this.waitForIframe()
    }

    private async gotoHomePageInBackend() {
        const contextPath = `/sites/testsite@user-${this.account.username}`
        await this.page.goto(`/neos/content?node=${encodeURIComponent(contextPath)}`);
        await this.waitForIframe();
    }

    private waitForIframe(timeout?: number) {
        return waitForDomEvent(this.page.locator(`iframe[name=neos-content-main]`), "load", { timeout })
    }

    private async createDocumentAndSelect(nodeTypeName: string, title: string) {
        await this.gotoHomePageInBackend()

        await this.page.click('#neos-ContentTree-AddNode');
        await this.page.click(`#neos-SelectNodeTypeDialog button[role="button"]:has-text("${nodeTypeName}")`);
    
        await this.page.fill(`#__neos__editor__property---title--creation-dialog`, title);
        await this.page.click(`#neos-NodeCreationDialog-CreateNew`);
        
        await this.waitForIframe()
    }
}
