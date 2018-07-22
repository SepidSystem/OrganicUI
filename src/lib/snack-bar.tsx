import * as React from 'react';

import Button from '@material-ui/core/Button';

 

import { withStyles } from '@material-ui/core/styles';
import { Utils } from './utils'
import { IMessageBarProps } from '@organic-ui';
import { SnackbarContent, IconButton } from './inspired-components';
import { CheckCircleIcon, WarningIcon, ErrorIcon, InfoIcon, CloseIcon } from './icons';
const variantIcon = {
    success: CheckCircleIcon,
    warning: WarningIcon,
    error: ErrorIcon,
    info: InfoIcon,
};
export function SnackBar(props: IMessageBarProps) {
    const {   className, children, onClose, variant, ...other } = props;
    const Icon = variantIcon[variant] as any;

    return (
        <SnackbarContent
            className={Utils.classNames( variant , className)}
            aria-describedby="client-snackbar"
            message={
                <span id="client-snackbar"  >
                    <Icon />
                    {children}
                </span>
            }
            action={
                <IconButton
                    key="close"
                    aria-label="Close"
                    color="inherit"
                    onClick={onClose as any}
                >
                    <CloseIcon />
                </IconButton>
            }
            {...other}
        />
    );
}