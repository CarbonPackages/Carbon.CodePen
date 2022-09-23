import { Page } from "@playwright/test";
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
            await this.page.click('text=Open CodePen')
            await sleep(100)
        }
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
