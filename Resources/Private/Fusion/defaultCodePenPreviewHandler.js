// @ts-check
/// <reference path="../../../../Carbon.CodePen/Resources/Private/Plugin/src/types.ts" />

window.configureCodePenPreview((codePenContext) => {
    // Default behaviour:
    // - render component server side
    // - inject tailwindstyles generated from the component html
    codePenContext.onContentDidChange(async ({ tabValues, tabId }) => {
        // render component server side
        codePenContext.renderComponentOutOfBand().then((content) => {
            const element = document.getElementById("carbon-codepen-preview") || document.body;
            element.innerHTML = content;
        }).then(() => {
            // generate tailwind styles
            codePenContext.library
                .generateTailwindStylesFromContent?.(
                    `@tailwind base;
                    @tailwind components;
                    @tailwind utilities;`,
                    [document.body.outerHTML]
                )
                .then((css) => {
                    const style = document.getElementById("_codePenTwStyle");
                    const newStyle = document.createElement("style");
                    newStyle.id = "_codePenTwStyle";
                    newStyle.innerHTML = css;
                    if (!style) {
                        document.head.append(newStyle);
                        return;
                    }
                    style.parentNode.replaceChild(newStyle, style);
                });
        })
    }, 500);
});
