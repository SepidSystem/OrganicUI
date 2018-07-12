import * as React from 'react';

import Button from '@material-ui/core/Button';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import InfoIcon from '@material-ui/icons/Info';
import CloseIcon from '@material-ui/icons/Close';
import green from '@material-ui/core/colors/green';
import amber from '@material-ui/core/colors/amber';
import IconButton from '@material-ui/core/IconButton';
import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import WarningIcon from '@material-ui/icons/Warning';
import { withStyles } from '@material-ui/core/styles';
import { Utils } from './utils'
import { IMessageBarProps } from '@organic-ui';
const variantIcon = {
    success: CheckCircleIcon,
    warning: WarningIcon,
    error: ErrorIcon,
    info: InfoIcon,
};
export function MessageBar(props: IMessageBarProps) {
    const {   className, children, onClose, variant, ...other } = props;
    const Icon = variantIcon[variant];

    return (
        <MaterialUI.SnackbarContent
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