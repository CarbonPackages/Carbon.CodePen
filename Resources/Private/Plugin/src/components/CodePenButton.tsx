// @ts-ignore
import React from "react";
import I18n from "@neos-project/neos-ui-i18n";
import { Button, Icon } from "@neos-project/react-ui-components";

type Props = {
    label: string;
    disabled?: boolean;
    onClick(): void;
    className: string;
};

export const CodePenButton = ({ label, disabled, onClick, className }: Props) => (
    <Button className={className} onClick={onClick} disabled={disabled}>
        <Icon icon="pencil" padded="right" title="Edit" />
        <I18n id={label} />
    </Button>
);
