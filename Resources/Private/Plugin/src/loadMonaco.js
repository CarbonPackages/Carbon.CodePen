const loadScript = src => {
	return new Promise((resolve, reject) => {
		const script = document.createElement('script')
		script.type = 'text/javascript'
		script.onload = resolve
		script.onerror = reject
		script.src = src
		document.head.append(script)
	})
}

export default async function getMonaco(scriptName) {
    if (window.__CarbonCodeEditorMonaco !== undefined) {
        return window.__CarbonCodeEditorMonaco
    }
    await loadScript(scriptName)
    return window.__CarbonCodeEditorMonaco
}
