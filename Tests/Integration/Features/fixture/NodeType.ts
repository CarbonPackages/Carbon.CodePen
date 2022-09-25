
export type NodeTypeName = "Carbon.TestSite:AfxFeaturesCodePen"
    | "Carbon.TestSite:BasicCodePen"
    | "Carbon.TestSite:CustomCompletionCodePen"
    | "Carbon.TestSite:HtmlFeaturesCodePen"
    | "Carbon.TestSite:MultiTabsCodePen"
    | "Carbon.TestSite:Page"
    | "Carbon.TestSite:SingleTextCodePen"
    | "Carbon.TestSite:TailwindCodePen"
    | "Carbon.TestSite:YamlFeaturesCodePen"
    | "Carbon.TestSite:MultiplePropertiesCodePen"

export class NodeType {
    private isOptional: boolean = false;

    public constructor(
        public readonly value: NodeTypeName
    ) {
    }

    public optional() {
        const clone = new NodeType(this.value)
        clone.isOptional = true;
        return clone;
    }

    public toString() {
        /** `@optional` to be used as --grep-invert marker in test discription */
        return this.value + (this.isOptional ? " @optional" : "");
    }
}

export type NodeTypeLike = NodeTypeName | NodeType
