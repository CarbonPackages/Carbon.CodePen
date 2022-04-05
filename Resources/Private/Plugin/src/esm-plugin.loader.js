
const loadScript = src => {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script')
        script.type = 'module'
        script.onload = resolve
        script.onerror = reject
        script.src = src
        document.head.append(script)
    })
}

loadScript(new URL('./Plugin.js', document.currentScript.src).pathname)
