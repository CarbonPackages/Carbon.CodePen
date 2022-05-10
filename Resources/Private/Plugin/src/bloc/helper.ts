export const objectIsEmpty = (obj: object) => {
    for (var _key in obj) {
        return false;
    }
    return true;
};

export const insertHtmlStringAndRunScriptTags = (
    targetDocument: Document,
    targetEl: HTMLElement,
    html: string
) => {
    // https://stackoverflow.com/questions/1197575/can-scripts-be-inserted-with-innerhtml

    // create a temporary container and insert provided HTML code
    const container = targetDocument.createElement("div");
    container.innerHTML = html;
    // cache a reference to all the scripts in the container
    const scripts = container.querySelectorAll("script");
    // get all child elements and clone them in the target element
    const nodes = container.childNodes;

    Array.from(nodes).forEach((node) => targetEl.appendChild(node));

    // force the found scripts to execute...
    Array.from(scripts).forEach((script) => {
        const tempScript = targetDocument.createElement("script");
        tempScript.type = script.type || "text/javascript";

        if (script.src) {
            tempScript.src = script.src;
        }
        tempScript.innerHTML = script.innerHTML;
        tempScript.dataset.hello = "mion";
        targetDocument.head.appendChild(tempScript);
        targetDocument.head.removeChild(tempScript);
    });

    container.remove();
};
