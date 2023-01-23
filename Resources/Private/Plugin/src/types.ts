
export type RawCompletion = string | string[];

export type CodePenEditorOptions = Readonly<{
    tabs?: {
        [id: string]: {
            label?: string;
            icon?: string;
            language?: string;
            completion?: RawCompletion;
        };
    };
    disabled?: boolean;
}>;

export type Tab = Readonly<{
    id: string;
    language: string;
    label: string;
    icon: string;
    completion?: RawCompletion;
}>;

export type ContentChangeListener = (args: {
    tabId: string;
    tabValues: Record<string, string>;
}) => void;

export type CodePenContext = {
    onContentDidChange(
        listener: ContentChangeListener,
        debounce?: number
    ): void;
    renderComponentOutOfBand(): Promise<string>;

    library: {
        generateTailwindStylesFromContent?(
            baseCss: string,
            content: string[]
        ): Promise<string>;
    };
};

export type ConfigureCodePenBootstrap = (
    codePenContext: CodePenContext
) => void;

declare global {
    interface Window {
        configureCodePenPreview(bootstrap: ConfigureCodePenBootstrap): void;
    }
}
