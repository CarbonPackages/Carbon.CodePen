import { editor } from "monaco-editor";

const languagesStylesheets = [
    'css', 'scss', 'less'
]

const languagesWithTwoIndents = [
    'yaml', 'markdown', ...languagesStylesheets
]

type EditorOptions = editor.IStandaloneEditorConstructionOptions;

export const getEditorConfigForLanguage = (language: string): EditorOptions => {
    let options: EditorOptions = {
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
