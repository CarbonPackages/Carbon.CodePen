// @ts-ignore
import React from "react";
import I18n from "@neos-project/neos-ui-i18n";
import { Button, Icon } from "@neos-project/react-ui-components";

type Props = {
    label: string;
    disabled?: boolean;
    onClick(): void;
};

export const CodePenButton = ({ label, disabled, onClick }: Props) => (
    <div>
        <Button onClick={onClick} disabled={disabled}>
            <Icon icon="pencil" padded="right" title="Edit" />
            <I18n id={label} />
        </Button>
    </div>
);
