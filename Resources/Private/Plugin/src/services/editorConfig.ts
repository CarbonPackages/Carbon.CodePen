import { editor } from "monaco-editor";

const languagesStylesheets = ["css", "scss", "less"];

const languagesWithTwoIndents = ["yaml", "markdown", ...languagesStylesheets];

type EditorOptions = editor.IStandaloneEditorConstructionOptions;

export const getEditorConfigForLanguage = (
    language: string
): EditorOptions => ({
    //
    // Basic Config
    //
    roundedSelection: true,
    scrollBeyondLastLine: false,
    insertSpaces: true,
    detectIndentation: true,
    copyWithSyntaxHighlighting: false,

    //
    // Languages With Two Indents
    //
    tabSize: languagesWithTwoIndents.includes(language) ? 2 : 4,

    //
    // Languages Stylesheets
    //
    ...(languagesStylesheets.includes(language)
        ? {
              wordWrap: "wordWrapColumn",
              wordWrapColumn: 300,
          }
        : {
              // reset to default
              wordWrap: "off",
              wordWrapColumn: 80,
          }),

    //
    // Language Markdown
    //
    ...(language === "markdown"
        ? {
              trimAutoWhitespace: false,
              wordWrap: "wordWrapColumn",
              wordWrapColumn: 200,
          }
        : {
              // reset to default
              trimAutoWhitespace: true,
              wordWrap: "off",
              wordWrapColumn: 80,
          }),
});
