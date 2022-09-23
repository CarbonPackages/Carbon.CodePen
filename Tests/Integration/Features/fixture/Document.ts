import { Locator, Page } from "@playwright/test";
import { ContentElement } from "./ContentElement";
import { NodeType, NodeTypeLike } from "./NodeType";

type ContentElementCallback = ((args: {contentElement: ContentElement}) => Promise<void>);

export class Document {
    constructor(private page: Page, private contentMutationAllowed: boolean) {
    }

    private async discardPendingChanges() {
        if (await this.page.isEnabled('#neos-Inspector-Discard')) {
            await this.page.click('#neos-Inspector-Discard')
        }
    }

    async withNewContentElement(nodeType: NodeTypeLike, callback: ContentElementCallback) {
        await this.createNodeInCollection(nodeType)
        await callback({contentElement: new ContentElement(this.page, this.contentMutationAllowed)})
        await this.discardPendingChanges()
    }

    async withContentElement(nodeType: NodeTypeLike, callback: ContentElementCallback) {        
        if (await this.getNodeInContentTree(nodeType).count() > 0) {
            await this.getNodeInContentTree(nodeType).first().click();
        } else {
            await this.createNodeInCollection(nodeType);
        }
        await callback({contentElement: new ContentElement(this.page, this.contentMutationAllowed)})
        await this.discardPendingChanges()
    }

    private async createNodeInCollection(nodeType: NodeTypeLike) {
        await this.getNodeInContentTree("Content Collection (main)").click()
        await this.page.click('#neos-ContentTree-AddNode');
        await this.page.click(`#neos-SelectNodeTypeDialog button[role="button"]:has-text(${this.nodeTypeToSelector(nodeType)})`);
        return
    }

    private getNodeInContentTree(nodeType: NodeTypeLike | string): Locator {
        return this.page.locator(`[class^="style__leftSideBar__bottom"] div[role="button"]:has-text(${this.nodeTypeToSelector(nodeType)})`);
    }

    private nodeTypeToSelector(nodeType: NodeTypeLike | string) {
        if (nodeType instanceof NodeType) {
            nodeType = nodeType.value;
        }
        return JSON.stringify(nodeType)
    }
}
