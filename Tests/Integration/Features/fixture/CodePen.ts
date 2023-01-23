import { Page, expect, Locator } from "@playwright/test";
import { sleep } from "./sleep";

export class CodePen {
    constructor(private page: Page) {
    }

    async insert(text: string) {
        await this.page.evaluate((text) => navigator.clipboard.writeText(text), text)
        await this.codePenInput.press("Control+KeyV")
    }

    async type(text: string) {
        await this.codePenInput.type(text, { delay: 50 });
    }

    async pressTab() {
        await this.codePenInput.press("Tab")
    }

    async pressEscape() {
        await this.codePenInput.press("Escape")
    }

    async saveShortcut() {
        await this.codePenInput.press("Control+KeyS")
    }

    async closeShortcut() {
        await this.codePenInput.press("Control+KeyQ")
    }

    async forceComplection() {
        await this.codePenInput.press('Control+ ');
    }

    async pressArrowRight() {
        await this.codePenInput.press("ArrowRight")
    }

    async expectSuggestionsContain(text: string | RegExp) {
        await expect(this.codePenEditor.locator(`[widgetid="editor.widget.suggestWidget"]`)).toContainText(text);
    }

    async expectDocumentationsContain(text: string | RegExp) {
        await expect(this.codePenEditor.locator(`[widgetid="editor.contrib.contentHoverWidget"]`)).toContainText(text);
    }

    async toogleRotation() {
        await this.secondaryInspector.locator("ul>li").first().click()
    }

    async fill<T extends string>(text: T extends "" ? never : T) {
        // this works on firefox in contrary to `codePenInput.fill()`
        await this.codePenInput.press("Control+KeyA")
        await this.insert(text)
        await this.expect(text)
    }

    async hoverOverText(text: string) {
        await this.codePenEditor.locator(`text=${text}`).hover({ force: true })
    }

    async undo() {
        await this.codePenInput.press('Control+Z');
    }

    async redo() {
        await this.codePenInput.press('Control+Shift+Z');
    }

    async expect<T extends string>(text: T extends "" ? never : T) {
        await expect(this.codePenInput).toHaveValue(text)
    }

    async expectEmpty() {
        await expect(this.codePenInput).toHaveValue("")
    }

    async clear() {
        await this.codePenInput.press("Control+KeyA")
        await this.codePenInput.press("Delete")
    }

    async selectTab(label: string) {
        await this.secondaryInspector.locator(`text=${label}`).click()
        await sleep(100)
    }

    async expectInputToHaveScreenshot(name: string) {
        // we make it fullscreen so we dont test the minimap and so on in this test
        await this.expectLocatorToHaveScreenshot(name, this.codePenEditor.locator(".view-lines"))
    }

    async expectPreviewToHaveScreenshot(name: string) {
        await this.expectLocatorToHaveScreenshot(name, this.secondaryInspector.locator('iframe[src^="/neos/codePen"]'))
    }

    async expectToHaveScreenshot(name: string) {
        // is not done full screen ...
        await expect(this.secondaryInspector).toHaveScreenshot(name, { maxDiffPixels: 50 });
    }

    async expectPreview(text: string) {
        await expect(this.codePenPreview.locator("body")).toHaveText(text)
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
