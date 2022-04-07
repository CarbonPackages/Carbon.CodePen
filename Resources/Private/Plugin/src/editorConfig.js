const languagesStylesheets = [
    'css', 'scss', 'less'
]

const languagesWithTwoIndents = [
    'yaml', 'markdown', ...languagesStylesheets
]

export const getEditorConfigForLanguage = (language) => {
    // https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.IStandaloneEditorConstructionOptions.html
    let options = {
        roundedSelection: true,
        scrollBeyondLastLine: false,
        insertSpaces: true,
        detectIndentation: true,
        copyWithSyntaxHighlighting: false
    };

    if (languagesWithTwoIndents.includes(language)) {
        options.tabSize = 2;
    }

    if (languagesStylesheets.includes(language)) {
        options.wordWrap = "wordWrapColumn"
        options.wordWrapColumn = 300
    }

    if (language === 'markdown') {
        options.trimAutoWhitespace = false;
        options.wordWrap = "wordWrapColumn"
        options.wordWrapColumn = 200
    }

    return options;
}
