import { Locator, Page } from "@playwright/test";
import { ContentElement } from "./ContentElement";

type ContentElementCallback = ((args: {contentElement: ContentElement}) => Promise<void>);

export class Document {

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
        await this.page.click(`#neos-SelectNodeTypeDialog button[role="button"] >> text=${JSON.stringify(nodeNameLabel)}`);
        return
    }

    private getNodeInContentTree(nodeNameLabel: string): Locator {
        return this.page.locator(`[class^="style__leftSideBar__bottom"] div[role="button"] >> text=${JSON.stringify(nodeNameLabel)}`);
    }
}