
import { Utils } from '../core/utils'
import { IMessageBarProps } from '@organic-ui';
import { Button,SnackbarContent, IconButton } from './inspired-components';
import { CheckCircleIcon, WarningIcon, ErrorIcon, InfoIcon, CloseIcon } from './icons';
const variantIcon = {
    success: CheckCircleIcon,
    warning: WarningIcon,
    error: ErrorIcon,
    info: InfoIcon,
};
export function SnackBar(props: IMessageBarProps) {
    const { className, children, onClose, variant } = props;
    const Icon = variantIcon[variant] as any;

    return (
        <SnackbarContent
        {...props}
            className={Utils.classNames(variant,props.className, className)}
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
                    {!!onClose && <CloseIcon />}
                </IconButton>
            }
         
        />
    );
}