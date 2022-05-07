import { Node } from "@neos-project/neos-ts-interfaces";

type StaticCompletion = string[] | Promise<string>[];

interface LazyCompletion {
    (params: { node: Node }): StaticCompletion;
}

type Completion = LazyCompletion | StaticCompletion | string;

export type CodePenEditorOptions = Readonly<{
    tabs?: {
        [id: string]: {
            label?: string;
            icon?: string;
            language?: string;
            completion?: Completion;
        };
    };
    disabled?: boolean;
}>;

export type Tab = Readonly<{
    id: string;
    language: string;
    label: string;
    icon: string;
    completion?: Completion;
    getValue(): string | undefined;
    setValue(newValue: string): void;
}>;
