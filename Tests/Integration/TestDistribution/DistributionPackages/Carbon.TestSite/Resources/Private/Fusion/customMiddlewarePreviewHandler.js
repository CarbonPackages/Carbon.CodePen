// @ts-check
/// <reference path="../../../../../../../../../Carbon.CodePen/Resources/Private/Plugin/src/types.ts" />

window.configureCodePenPreview((codePenContext) => {
    codePenContext.onContentDidChange(async ({ tabValues, tabId }) => {
        document.body.innerText = JSON.stringify({tabValues, tabId});
    }, 500);
});
