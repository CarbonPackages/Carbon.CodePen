import { Locator } from "@playwright/test";

/**
 * @example waitForDomEvent(page.locator(`iframe`), "load")
 */
export const waitForDomEvent = (locator: Locator, eventName: keyof HTMLElementEventMap, options?: {timeout?: number}) => {
    return locator.evaluate((element, serializedEventName) => {
        return new Promise<void>((resolve) => {
            element.addEventListener(serializedEventName, () => resolve(), {once: true})
        })
    }, eventName, options);
}
