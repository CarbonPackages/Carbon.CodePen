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
    import {
        InferableComponentEnhancerWithProps,
        ConnectedProps,
    } from "react-redux";
    import { GlobalRegistry } from "@neos-project/neos-ts-interfaces";

    export interface NeosContextInterface {
        globalRegistry: GlobalRegistry;
        configuration: {};
        routes: {};
    }

    /**
     * Infers the type of props that a neosifier will inject into a component.
     * we reuse this behavior from {@see ConnectedProps}
     */
    export type NeosifiedProps<TNeosifier> = ConnectedProps<TNeosifier>;

    export const NeosContext: React.Context<NeosContextInterface | null>;

    type MapRegistryToPropsParam<TStateProps> = (
        globalRegistry: GlobalRegistry
    ) => TStateProps;

    interface Neos {
        <TStateProps = {}, TOwnProps = {}>(
            mapRegistryToProps: MapRegistryToPropsParam<TStateProps>
        ): InferableComponentEnhancerWithProps<
            TStateProps & { neos: NeosContextInterface },
            TOwnProps
        >;
    }

    export const neos: Neos;
}

declare module "@neos-project/neos-ui-extensibility" {
    // @ts-ignore we dont require the @types/redux as they are deprecated
    import { Store } from "redux";
    import {
        GlobalRegistry,
        FrontendConfigurationRaw,
    } from "@neos-project/neos-ts-interfaces";

    type BootstrapOptions = {
        store: Store;
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
    export function isNode(node: any): node is Node;

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
            params?: {},
            packageKey?: string,
            sourceName?: string,
            quantity?: 0
        ) => string;
    }

    interface RegisteredEditor {
        component: React.ElementType;
        hasOwnLabel?: boolean;
    }

    interface EditorRegistry extends SynchronousRegistry<RegisteredEditor> {}

    interface InspectorRegistry extends SynchronousMetaRegistry<any> {
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
    type Configuration = unknown;

    type FrontendConfigurationRaw = Record<
        VendorPackageName | NeosUiOption,
        Configuration
    >;

    export interface FrontendConfigurationRegistry
        extends SynchronousRegistry<Configuration> {
        get: (
            firstLevelKey: VendorPackageName | NeosUiOption
        ) => Configuration | null;
    }

    export interface GlobalRegistry extends SynchronousMetaRegistry<any> {
        get: <
            K extends
                | "i18n"
                | "validators"
                | "inspector"
                | "frontendConfiguration"
        >(
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

declare module "@neos-project/react-ui-components" {
    import enhanceWithClickOutside from "@neos-project/react-ui-components/lib-esm/enhanceWithClickOutside";
    import Badge from "@neos-project/react-ui-components/lib-esm/Badge/badge";
    import Bar from "@neos-project/react-ui-components/lib-esm/Bar/bar";
    import Button from "@neos-project/react-ui-components/lib-esm/Button/button";
    import ButtonGroup from "@neos-project/react-ui-components/lib-esm/ButtonGroup/buttonGroup";
    import CheckBox from "@neos-project/react-ui-components/lib-esm/CheckBox/checkBox";
    import DateInput from "@neos-project/react-ui-components/lib-esm/DateInput/dateInput";
    import Dialog from "@neos-project/react-ui-components/lib-esm/Dialog/dialog";
    import DropDown from "@neos-project/react-ui-components/lib-esm/DropDown/wrapper";
    import Frame from "@neos-project/react-ui-components/lib-esm/Frame/frame";
    import Headline from "@neos-project/react-ui-components/lib-esm/Headline/headline";
    import Icon from "@neos-project/react-ui-components/lib-esm/Icon/icon";
    import IconButton from "@neos-project/react-ui-components/lib-esm/IconButton/iconButton";
    import IconButtonDropDown from "@neos-project/react-ui-components/lib-esm/IconButtonDropDown/iconButtonDropDown";
    import Label from "@neos-project/react-ui-components/lib-esm/Label/label";
    // @ts-expect-error not correctly exported
    import Logo from "@neos-project/react-ui-components/lib-esm/Logo";
    // @ts-expect-error not correctly exported
    import SelectBox from "@neos-project/react-ui-components/lib-esm/SelectBox";
    import SideBar from "@neos-project/react-ui-components/lib-esm/SideBar/sideBar";
    import Tabs from "@neos-project/react-ui-components/lib-esm/Tabs/tabs";
    import TextArea from "@neos-project/react-ui-components/lib-esm/TextArea/textArea";
    import TextInput from "@neos-project/react-ui-components/lib-esm/TextInput/textInput";
    // @ts-expect-error not correctly exported
    import ToggablePanel from "@neos-project/react-ui-components/lib-esm/ToggablePanel";
    import Tooltip from "@neos-project/react-ui-components/lib-esm/Tooltip/tooltip";
    // @ts-expect-error not correctly exported
    import Tree from "@neos-project/react-ui-components/lib-esm/Tree";
    // @ts-expect-error not correctly exported
    import MultiSelectBox from "@neos-project/react-ui-components/lib-esm/MultiSelectBox";
    // @ts-expect-error not correctly exported
    import MultiSelectBox_ListPreviewSortable from "@neos-project/react-ui-components/lib-esm/MultiSelectBox_ListPreviewSortable";
    // @ts-expect-error not correctly exported
    import SelectBox_Option_SingleLine from "@neos-project/react-ui-components/lib-esm/SelectBox_Option_SingleLine";
    // @ts-expect-error not correctly exported
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
}
