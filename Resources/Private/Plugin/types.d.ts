declare module "@neos-project/neos-ui-editors" {
    export type EditorProps<Options = {}> = {
        id?: string;
        renderHelpIcon(): JSX.Element | "";
        identifier: string;
        label: string;
        options: Options;
        value?: any;
        hooks?: object;
        renderSecondaryInspector(
            secondaryInspectorName: string,
            secondaryInspectorComponentFactory: () => React.ReactElement
        ): void;
        editor: string;
        editorRegistry: object;
        i18nRegistry: object;
        onEnterKey(): void;
        helpMessage?: string;
        helpThumbnail?: string;
        highlight?: boolean;
        commit(value: any, hooks?): void;
    };
}

// declare module 'plow-js' {
//     interface Transform {
//         <T extends object>(T): ((state) => T);
//     }
//     export const $transform: Transform;
// }

declare module "@neos-project/neos-ui-redux-store" {
    import { Node } from "@neos-project/neos-ts-interfaces";
    import { DefaultRootState } from "react-redux";

    type Selector<S> = (state: DefaultRootState) => S;

    type Selectors = {
        CR: {
            Nodes: {
                focusedSelector: Selector<Node | undefined>;
            };
        };
    };

    export const selectors: Selectors;
}

declare module "@neos-project/neos-ui-decorators" {
    import { GlobalRegistry } from "@neos-project/neos-ts-interfaces";

    // export const foo: <OwnProps extends {}, InjectedProps extends {}>(exraPropst: InjectedProps) => (WrappedComponent: React.ComponentType<OwnProps & InjectedProps>)
    import {
        MapDispatchToPropsParam,
        MapStateToPropsParam,
        MergeProps,
        Options,
    } from "react-redux";

    export interface NeosContextInterface {
        globalRegistry: GlobalRegistry;
        configuration: {};
        routes: {};
    }
    export declare type NeosInjectedProps<R extends (...args: any[]) => any> =
        ReturnType<R> & {
            neos: NeosContextInterface;
        };
    export declare const NeosContext: React.Context<NeosContextInterface | null>;

    // export const neos: <TOwnProps = {}, TInjectedProps = {}>(
    //     mapRegistriesToProps: (globalRegistry: GlobalRegistry) => any,
    //     mapStateToProps?: MapStateToPropsParam<TStateProps, TOwnProps, StoreState>,
    // ) => <TComponent extends React.ComponentType<TOwnProps & TInjectedProps>>(component: TComponent) => TComponent;

    export const neos: <OwnProps extends {}, InjectedProps extends {}>(
        mapRegistriesToProps: (globalRegistry: GlobalRegistry) => any
    ) => (WrappedComponent: React.ComponentType<OwnProps & InjectedProps>) => {
        new (props: OwnProps | Readonly<OwnProps>): {
            render(): JSX.Element;
            context: unknown;
            setState<K extends never>(
                state:
                    | {}
                    | ((
                          prevState: Readonly<{}>,
                          props: Readonly<OwnProps>
                      ) => {} | Pick<{}, K> | null)
                    | Pick<{}, K>
                    | null,
                callback?: (() => void) | undefined
            ): void;
            forceUpdate(callback?: (() => void) | undefined): void;
            readonly props: Readonly<OwnProps>;
            state: Readonly<{}>;
            refs: {
                [key: string]: React.ReactInstance;
            };
            componentDidMount?(): void;
            shouldComponentUpdate?(
                nextProps: Readonly<OwnProps>,
                nextState: Readonly<{}>,
                nextContext: any
            ): boolean;
            componentWillUnmount?(): void;
            componentDidCatch?(error: Error, errorInfo: React.ErrorInfo): void;
            getSnapshotBeforeUpdate?(
                prevProps: Readonly<OwnProps>,
                prevState: Readonly<{}>
            ): any;
            componentDidUpdate?(
                prevProps: Readonly<OwnProps>,
                prevState: Readonly<{}>,
                snapshot?: any
            ): void;
            componentWillMount?(): void;
            UNSAFE_componentWillMount?(): void;
            componentWillReceiveProps?(
                nextProps: Readonly<OwnProps>,
                nextContext: any
            ): void;
            UNSAFE_componentWillReceiveProps?(
                nextProps: Readonly<OwnProps>,
                nextContext: any
            ): void;
            componentWillUpdate?(
                nextProps: Readonly<OwnProps>,
                nextState: Readonly<{}>,
                nextContext: any
            ): void;
            UNSAFE_componentWillUpdate?(
                nextProps: Readonly<OwnProps>,
                nextState: Readonly<{}>,
                nextContext: any
            ): void;
        };
        new (props: OwnProps, context: any): {
            render(): JSX.Element;
            context: unknown;
            setState<K extends never>(
                state:
                    | {}
                    | ((
                          prevState: Readonly<{}>,
                          props: Readonly<OwnProps>
                      ) => {} | Pick<{}, K> | null)
                    | Pick<{}, K>
                    | null,
                callback?: (() => void) | undefined
            ): void;
            forceUpdate(callback?: (() => void) | undefined): void;
            readonly props: Readonly<OwnProps>;
            state: Readonly<{}>;
            refs: {
                [key: string]: React.ReactInstance;
            };
            componentDidMount?(): void;
            shouldComponentUpdate?(
                nextProps: Readonly<OwnProps>,
                nextState: Readonly<{}>,
                nextContext: any
            ): boolean;
            componentWillUnmount?(): void;
            componentDidCatch?(error: Error, errorInfo: React.ErrorInfo): void;
            getSnapshotBeforeUpdate?(
                prevProps: Readonly<OwnProps>,
                prevState: Readonly<{}>
            ): any;
            componentDidUpdate?(
                prevProps: Readonly<OwnProps>,
                prevState: Readonly<{}>,
                snapshot?: any
            ): void;
            componentWillMount?(): void;
            UNSAFE_componentWillMount?(): void;
            componentWillReceiveProps?(
                nextProps: Readonly<OwnProps>,
                nextContext: any
            ): void;
            UNSAFE_componentWillReceiveProps?(
                nextProps: Readonly<OwnProps>,
                nextContext: any
            ): void;
            componentWillUpdate?(
                nextProps: Readonly<OwnProps>,
                nextState: Readonly<{}>,
                nextContext: any
            ): void;
            UNSAFE_componentWillUpdate?(
                nextProps: Readonly<OwnProps>,
                nextState: Readonly<{}>,
                nextContext: any
            ): void;
        };
        readonly Original: React.ComponentType<OwnProps & InjectedProps>;
        readonly contextType: React.Context<NeosContextInterface | null>;
        readonly displayName: string;
    };

    // import React from 'react';
    // import { GlobalRegistry } from '@neos-project/neos-ts-interfaces';

    // export interface NeosContextInterface {
    //     globalRegistry: GlobalRegistry;
    //     configuration: {};
    //     routes: {};
    // }

    // export type NeosInjectedProps<R extends (...args: any[]) => any> = ReturnType<R> & {neos: NeosContextInterface};

    // export const NeosContext = React.createContext<NeosContextInterface | null>(null);

    // //
    // // A higher order component to easily spread global
    // // configuration
    // export const neos = <OwnProps extends {}, InjectedProps extends {}> (mapRegistriesToProps: (globalRegistry: GlobalRegistry) => any) => (WrappedComponent: React.ComponentType<OwnProps & InjectedProps>) => {
    // }
}

declare module "@neos-project/neos-ui-extensibility" {
    import {
        GlobalRegistry,
        FrontendConfigurationRaw,
    } from "@neos-project/neos-ts-interfaces";
    // import { Store } from 'redux';

    type BootstrapOptions = {
        // store: Store,
        store;
        frontendConfiguration: FrontendConfigurationRaw;
        configuration;
        routes;
    };

    type Bootstrap = (
        globalRegistry: GlobalRegistry,
        bootstrapOptions: BootstrapOptions
    ) => void;

    export default function manifest(
        identifier: string,
        options: {},
        bootstrap: Bootstrap
    ): void;

    export {
        SynchronousMetaRegistry,
        SynchronousRegistry,
    } from "@mhsdesign/esbuild-neos-ui-extensibility/@neos-project/neos-ui-extensibility/src/registry";
}

declare module "@neos-project/neos-ts-interfaces" {
    export type NodeContextPath = string;
    export type FusionPath = string;
    export type NodeTypeName = string;
    export type WorkspaceName = string;

    export type DimensionName = string;
    export type DimensionValue = string;
    export type DimensionPresetName = string;

    export type DimensionValues = DimensionValue[];

    export interface DimensionCombination {
        [propName: string]: DimensionValues;
    }

    export interface DimensionPresetCombination {
        [propName: string]: DimensionPresetName;
    }

    export interface PresetConfiguration {
        name?: string;
        label: string;
        values: DimensionValues;
        uriSegment: string;
    }

    export interface DimensionInformation {
        default: string;
        defaultPreset: string;
        label: string;
        icon: string;
        presets: {
            [propName: string]: PresetConfiguration;
        };
    }

    export interface ContextProperties {
        contextPath?: NodeContextPath;
        workspaceName?: WorkspaceName;
        invisibleContentShown?: boolean;
        removedContentShown?: boolean;
    }

    export interface NodeChild {
        contextPath: NodeContextPath;
        nodeType: NodeTypeName;
    }
    // TODO: for some reason (probably due to immer) I can not use ReadonlyArray here
    export interface NodeChildren extends Array<NodeChild> {}

    export interface NodePolicy
        extends Readonly<{
            disallowedNodeTypes: NodeTypeName[];
            canRemove: boolean;
            canEdit: boolean;
            disallowedProperties: string[];
        }> {}

    // TODO: for some reason (probably due to immer) I can not use Readonly here
    export interface Node {
        contextPath: NodeContextPath;
        name: string;
        identifier: string;
        nodeType: NodeTypeName;
        label: string;
        isAutoCreated: boolean;
        depth: number;
        children: NodeChildren;
        matchesCurrentDimensions: boolean;
        properties: {
            [propName: string]: any;
        };
        isFullyLoaded: boolean;
        uri: string;
        parent: NodeContextPath;
        policy?: NodePolicy;
        dimensions?: DimensionPresetCombination;
        otherNodeVariants?: DimensionPresetCombination[];
    }

    // Type guard using duck-typing on some random properties to know if object is a Node
    export const isNode = (node: any): node is Node =>
        Boolean(typeof node === "object" && node.contextPath);

    export interface NodeMap {
        [propName: string]: Node | undefined;
    }

    export enum ClipboardMode {
        COPY = "Copy",
        MOVE = "Move",
    }

    export enum InsertPosition {
        INTO = "into",
        BEFORE = "before",
        AFTER = "after",
    }

    export enum SelectionModeTypes {
        SINGLE_SELECT = "SINGLE_SELECT",
        MULTIPLE_SELECT = "MULTIPLE_SELECT",
        RANGE_SELECT = "RANGE_SELECT",
    }

    export interface ValidatorConfiguration {
        [propName: string]: any;
    }

    export interface PropertyConfiguration {
        type?: string;
        ui?: {
            label?: string;
            reloadIfChanged?: boolean;
            inline?: {
                editor?: string;
                editorOptions?: {
                    [propName: string]: any;
                };
            };
            inlineEditable?: boolean;
            inspector?: {
                hidden?: boolean;
                defaultValue?: string;
                editor?: string;
                editorOptions?: {
                    [propName: string]: any;
                };
                group?: string;
                position?: number | string;
            };
            help?: {
                message?: string;
                thumbnail?: string;
            };
            aloha?: any; // deprecated format
        };
        validation?: {
            [propName: string]: ValidatorConfiguration | undefined;
        };
    }

    export interface NodeType {
        name?: string;
        superTypes: {
            [propName: string]: boolean | undefined;
        };
        constraints: {
            nodeTypes: {
                [propName: string]: boolean | undefined;
            };
        };
        label?: string;
        ui?: {
            group?: string;
            icon?: string;
            label?: string;
            position?: number | string;
            inlineEditable?: boolean;
            inspector?: {
                groups?: {
                    [propName: string]:
                        | {
                              title?: string;
                              label?: string;
                              icon?: string;
                              tab?: string;
                              position?: number | string;
                              collapsed?: boolean;
                          }
                        | undefined;
                };
                tabs?: {
                    [propName: string]:
                        | {
                              label?: string;
                              position?: number | string;
                              icon?: string;
                          }
                        | undefined;
                };
                views?: {
                    [propName: string]: {
                        group?: string;
                        label?: string;
                        position?: number | string;
                        helpMessage?: string;
                        view?: string;
                        viewOptions?: {
                            [propName: string]: any;
                        };
                    };
                };
            };
            creationDialog?: {
                elements?: {
                    [propName: string]: {
                        type?: string;
                        ui?: {
                            label?: string;
                            editor?: string;
                            editorOptions?: {
                                [propName: string]: any;
                            };
                        };
                        validation?: {
                            [propName: string]: {
                                [propName: string]: any;
                            };
                        };
                    };
                };
            };
        };
        properties?: {
            [propName: string]: PropertyConfiguration | undefined;
        };
    }

    //
    // Change object from our Changes API
    //
    export interface Change
        extends Readonly<{
            type: string;
            subject: NodeContextPath;
            payload: {
                propertyName: string;
                value: any;
            };
        }> {}

    import {
        SynchronousMetaRegistry,
        SynchronousRegistry,
    } from "@neos-project/neos-ui-extensibility";

    // TODO: move to nodetypesregistry itself
    export interface NodeTypesRegistry extends SynchronousRegistry<NodeType> {
        get: (nodeType: NodeTypeName) => NodeType | null;
        getRole: (roleName: string) => NodeTypeName | null;
        getSubTypesOf: (nodeType: NodeTypeName) => NodeTypeName[];
        getAllowedNodeTypesTakingAutoCreatedIntoAccount: (
            isSubjectNodeAutocreated: boolean,
            referenceParentName: string,
            referenceParentNodeType: NodeTypeName,
            referenceGrandParentNodeType: NodeTypeName | null,
            role: string
        ) => NodeTypeName[];
    }

    // TODO: move to validatorsregistry itself
    type Validator = (
        values: {},
        elementConfigurations: any
    ) => null | {} | string;

    export interface ValidatorRegistry extends SynchronousRegistry<Validator> {}

    export interface I18nRegistry extends SynchronousRegistry<string> {
        translate: (
            id?: string,
            fallback?: string,
            params? = {},
            packageKey? = "Neos.Neos",
            sourceName? = "Main",
            quantity? = 0
        ) => string;
    }

    interface RegisteredEditor {
        component: React.ElementType;
        hasOwnLabel?: boolean;
    }

    interface EditorRegistry extends SynchronousRegistry<RegisteredEditor> {}

    interface InspectorRegistry
        extends SynchronousMetaRegistry<SynchronousRegistry> {
        get: <K extends "editors" | "secondaryEditors">(
            key: K
        ) => K extends "editors"
            ? EditorRegistry
            : K extends "secondaryEditors"
            ? EditorRegistry
            : never;
    }

    type VendorPackageName = string;
    type NeosUiOption = string;
    // basically what we can get from php arrays
    type Configuration = number | string | null | boolean | Record<number | string, Configuration>;

    type FrontendConfigurationRaw = Record<VendorPackageName | NeosUiOption, Configuration>

    export interface FrontendConfigurationRegistry extends SynchronousRegistry<Configuration> {
        get: (firstLevelKey: VendorPackageName | NeosUiOption) => Configuration | null;
    }

    export interface GlobalRegistry
        extends SynchronousMetaRegistry<SynchronousRegistry> {
        get: <K extends "i18n" | "validators" | "inspector" | "frontendConfiguration">(
            key: K
        ) => K extends "i18n"
            ? I18nRegistry
            : K extends "validators"
            ? ValidatorRegistry
            : K extends "inspector"
            ? InspectorRegistry
            : K extends "frontendConfiguration"
            ? FrontendConfigurationRegistry
            : never;
    }
}

declare module "@friendsofreactjs/react-css-themr" {
    // just return the component
    export function themr(
        componentName: string | number | Symbol,
        localTheme?: TReactCSSThemrTheme,
        options?: {}
    ): <C>(themedComponent: C) => C;
}

declare module "@neos-project/react-ui-components" {
    import enhanceWithClickOutside from "@neos-project/react-ui-components/lib-esm/enhanceWithClickOutside";
    import Badge from "@neos-project/react-ui-components/lib-esm/Badge";
    import Bar from "@neos-project/react-ui-components/lib-esm/Bar";
    import Button from "@neos-project/react-ui-components/lib-esm/Button";
    import ButtonGroup from "@neos-project/react-ui-components/lib-esm/ButtonGroup";
    import CheckBox from "@neos-project/react-ui-components/lib-esm/CheckBox";
    import DateInput from "@neos-project/react-ui-components/lib-esm/DateInput";
    import Dialog from "@neos-project/react-ui-components/lib-esm/Dialog";
    import DropDown from "@neos-project/react-ui-components/lib-esm/DropDown";
    import Frame from "@neos-project/react-ui-components/lib-esm/Frame";
    import Headline from "@neos-project/react-ui-components/lib-esm/Headline";
    import Icon from "@neos-project/react-ui-components/lib-esm/Icon";
    import IconButton from "@neos-project/react-ui-components/lib-esm/IconButton";
    import IconButtonDropDown from "@neos-project/react-ui-components/lib-esm/IconButtonDropDown";
    import Label from "@neos-project/react-ui-components/lib-esm/Label";
    import Logo from "@neos-project/react-ui-components/lib-esm/Logo";
    import SelectBox from "@neos-project/react-ui-components/lib-esm/SelectBox";
    import SideBar from "@neos-project/react-ui-components/lib-esm/SideBar";
    import Tabs from "@neos-project/react-ui-components/lib-esm/Tabs";
    import TextArea from "@neos-project/react-ui-components/lib-esm/TextArea";
    import TextInput from "@neos-project/react-ui-components/lib-esm/TextInput";
    import ToggablePanel from "@neos-project/react-ui-components/lib-esm/ToggablePanel";
    import Tooltip from "@neos-project/react-ui-components/lib-esm/Tooltip";
    import Tree from "@neos-project/react-ui-components/lib-esm/Tree";
    import MultiSelectBox from "@neos-project/react-ui-components/lib-esm/MultiSelectBox";
    import MultiSelectBox_ListPreviewSortable from "@neos-project/react-ui-components/lib-esm/MultiSelectBox_ListPreviewSortable";
    import SelectBox_Option_SingleLine from "@neos-project/react-ui-components/lib-esm/SelectBox_Option_SingleLine";
    import SelectBox_Option_MultiLineWithThumbnail from "@neos-project/react-ui-components/lib-esm/SelectBox_Option_MultiLineWithThumbnail";

    module "react" {
        // the removed SFC is used, which nearly equals the FC
        export type SFC<P = {}> = FC<P>;
    }

    export {
        enhanceWithClickOutside,
        Badge,
        Bar,
        Button,
        ButtonGroup,
        CheckBox,
        DateInput,
        Dialog,
        DropDown,
        Frame,
        Headline,
        Icon,
        IconButton,
        IconButtonDropDown,
        Label,
        Logo,
        SelectBox,
        SideBar,
        Tabs,
        TextArea,
        TextInput,
        ToggablePanel,
        Tooltip,
        Tree,
        MultiSelectBox,
        MultiSelectBox_ListPreviewSortable,
        SelectBox_Option_SingleLine,
        SelectBox_Option_MultiLineWithThumbnail,
    };

    export default {
        enhanceWithClickOutside,
        Badge,
        Bar,
        Button,
        ButtonGroup,
        CheckBox,
        DateInput,
        Dialog,
        DropDown,
        Frame,
        Headline,
        Icon,
        IconButton,
        IconButtonDropDown,
        Label,
        Logo,
        SelectBox,
        SideBar,
        Tabs,
        TextArea,
        TextInput,
        ToggablePanel,
        Tooltip,
        Tree,
        MultiSelectBox,
        MultiSelectBox_ListPreviewSortable,
        SelectBox_Option_SingleLine,
        SelectBox_Option_MultiLineWithThumbnail,
    };
}
