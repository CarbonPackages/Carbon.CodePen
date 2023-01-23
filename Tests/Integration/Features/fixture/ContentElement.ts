import { expect, Page } from "@playwright/test";
import { CodePen } from "./CodePen";
import { sleep } from "./sleep";

export class ContentElement {
    constructor(private page: Page, private contentMutationAllowed: boolean) {
    }

    async apply() {
        if (!this.contentMutationAllowed) {
            throw new Error("Cannot apply changes, as content mutations are not allowed.");
        }
        await this.page.click('#neos-Inspector-Apply');
        await sleep(500)
    }

    async discard() {
        await this.page.click('#neos-Inspector-Discard');
        await sleep(500)
    }

    async withCodePen(callback: ((args: {codePen: CodePen}) => Promise<void>)) {
        await this.page.click('text=Open CodePen');

        await this.codePenPreview.waitFor()

        await sleep(1500)

        await callback({codePen: new CodePen(this.page)})

        // auto close
        if (await this.codePenEditor.count() !== 0) {
            // selector for x button of secondary editor:
            await this.secondaryInspector.locator("> button").click()
            await sleep(100)
        }
    }

    async expectCodePenToBeClosed() {
        await expect(this.codePenEditor).toHaveCount(0)
    }

    async previewToHaveScreenshot(name: string) {
        await this.iframe.locator(`[id="neos-backend-container"]`)
            .evaluate((el) => el.style.display = "none")
        await expect(this.iframeRendering).toHaveScreenshot(name, { maxDiffPixels: 100 , maxDiffPixelRatio: .2 });
        await this.iframe.locator(`[id="neos-backend-container"]`)
            .evaluate((el) => el.style.display = "")        
    }

    async previewToContainText(contents: string) {
        await expect(this.iframeRendering).toContainText(contents)
    }

    async toHaveTranslatedOpener() {
        await expect(this.page.locator(`text="Open CodePen [Translated]"`)).toBeVisible()
    }

    async hideTheCodePenOpener() {
        await expect(this.page.locator(`text="Open CodePen"`)).toHaveCount(1)
        await this.page.click(`section > div[role="button"]:has-text("Code")`)
        await sleep(500)
        await expect(this.page.locator(`text="Open CodePen"`)).toHaveCount(0)
    }

    async expectHelpTextToContain(text: string) {
        await this.page.click('#neos-Inspector >> [data-icon="question-circle"]');
        await expect(this.page.locator(`text="${text}"`)).toBeVisible()
    }

    private get iframeRendering() {
        return this.iframe.locator(`[class^="style__markActiveNodeAsFocused--focusedNode"]`)
    }

    private get iframe() {
        return this.page.frameLocator(`iframe[name="neos-content-main"]`)
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
