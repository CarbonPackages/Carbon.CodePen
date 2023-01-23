import React from "react";
import { neos, NeosifiedProps } from "@neos-project/neos-ui-decorators";
import { connect, ConnectedProps } from "react-redux";
import { selectors, actions } from "@neos-project/neos-ui-redux-store";
import { EditorProps } from "@neos-project/neos-ts-interfaces";
import { PackageFrontendConfiguration } from "./manifest";
import { CodePenEditorOptions, Tab } from "./types";
import { CodePenButton } from "./components/CodePenButton";
import { CodePenBloc } from "./bloc/CodePenBloc";
import { provideCodePenPlock } from "./dependencyLoader";
import { afxMappedLanguageId } from "./services/afxMappedLanguageId";

const neosifier = neos((globalRegistry) => ({
    secondaryEditorsRegistry: globalRegistry
        .get("inspector")
        .get("secondaryEditors"),
    packageFrontendConfiguration: globalRegistry
        .get("frontendConfiguration")
        .get("Carbon.CodePen") as PackageFrontendConfiguration,
}));

const connector = connect(
    (state) => ({
        node: selectors.CR.Nodes.focusedSelector(state),
    }),
    {
        authenticationTimeout: actions.System.authenticationTimeout,
    }
);

type NeosProps = NeosifiedProps<typeof neosifier>;

type StateProps = ConnectedProps<typeof connector>;

type OwnProps = EditorProps<CodePenEditorOptions, Record<string, string>>;

type Props = NeosProps & StateProps & OwnProps;

class NeosUiCodePenApp extends React.PureComponent<Props> {
    private codePenBloc?: CodePenBloc;

    public warnUserForPossibleNotSavedChanges(e: Event) {
        const confirmationMessage = `Es könnte sein dass die letzten änderungen im CodePen noch nicht gespeichert sind.`;
        // @ts-expect-error
        (e || window.event).returnValue = confirmationMessage;
        return confirmationMessage;
    }

    public componentDidMount() {
        window.addEventListener(
            "beforeunload",
            this.warnUserForPossibleNotSavedChanges
        );
    }

    public componentDidUpdate() {
        this.codePenBloc?.updateNeosUiEditorTabValues(this.props.value ?? {});
    }

    public componentWillUnmount() {
        // this line is the reason for test "editor doesnt crash when CodePen opener is hidden" to crash,
        // and on first sight a removal helps, but then the out-of-band rendering stops working...
        this.codePenBloc?.detatchNeosUiEditor();
        window.removeEventListener(
            "beforeunload",
            this.warnUserForPossibleNotSavedChanges
        );
    }

    private retrieveTabs() {
        const rawTabConfig = this.props.options.tabs;
        if (!rawTabConfig) {
            throw new Error(
                `Carbon.CodePen cannot be initialized, because no tabs were defined in editiorOptions.`
            );
        }

        return Object.entries(rawTabConfig).map(
            ([id, { label, language, completion, icon }]) => ({
                id,
                label: label ?? `${language} [${id}]`,
                language:
                    language === "afx"
                        ? afxMappedLanguageId
                        : language ?? "html",
                icon: icon ?? "file",
                completion,
            })
        );
    }

    private initializeCodePenBlock = async () => {
        if (this.codePenBloc) {
            return;
        }

        this.codePenBloc = await provideCodePenPlock(
            this.props.packageFrontendConfiguration
        );

        let tabs: Tab[];
        try {
            tabs = this.retrieveTabs();
        } catch (e) {
            console.error((e as Error).message);
            return;
        }

        this.codePenBloc.connectToNeosUiEditor({
            node: this.props.node!,
            nodeTabProperty: this.props.identifier,
            tabValues: this.props.value ?? {},
            tabs,

            toggleCodePenWindow: this.toggleWindow,

            applyTabValues: this.applyPropertyValue,
            commitTabValues: this.commitPropertyValue,
            resetTabValues: this.resetPropertyValue,

            requestLogin: this.props.authenticationTimeout,
        });
    };

    public toggleWindow = () => {
        this.props.renderSecondaryInspector(
            "CARBON_CODEPEN_WINDOW",
            this.renderWindow
        );
    };

    public applyPropertyValue = () => {
        this.props.onEnterKey();
    };

    public resetPropertyValue = () => {
        // nope its not commit(null); to reset, but will be treated as null.
        this.props.commit("");
    };

    public commitPropertyValue = (newValue: Record<string, string>) => {
        this.props.commit(newValue);
    };

    public handleClick = async () => {
        await this.initializeCodePenBlock();
        this.codePenBloc!.toggleCodePenWindow();
    };

    public renderWindow = () => {
        const CodePenWindow = this.props.secondaryEditorsRegistry.get(
            "Carbon.CodePen/CodeEditorWrap"
        )!
            .component as typeof import("./components/CodePenWindow").CodePenWindow;

        return <CodePenWindow codePenBloc={this.codePenBloc!} />;
    };

    public render() {
        return (
            <div>
                <CodePenButton
                    className={this.props.className}
                    disabled={this.props.options.disabled}
                    label={this.props.label}
                    onClick={this.handleClick}
                />
                {this.props.renderHelpIcon()}
            </div>
        );
    }
}

export default neosifier(connector(NeosUiCodePenApp));
