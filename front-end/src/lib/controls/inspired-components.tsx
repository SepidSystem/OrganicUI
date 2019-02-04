
import { default as _TextField, OutlinedInputProps as TextFieldProps } from '@material-ui/core/OutlinedInput';
export const TextField: React.SFC<Partial<TextFieldProps>> = _TextField as any;
//import { default as _$1, $1Props } from '@material-ui/core/$1';
//export const $1: React.SFC<$1Props> = _$1 as any;

import { default as _Button, ButtonProps } from '@material-ui/core/Button';
export const Button: React.SFC<ButtonProps> = _Button as any;

import { default as _Checkbox, CheckboxProps } from '@material-ui/core/Checkbox';
export const Checkbox: React.SFC<CheckboxProps> = _Checkbox as any;

import { default as _Switch, SwitchProps } from '@material-ui/core/Switch';
export const Switch: React.SFC<SwitchProps> = _Switch as any;


import { default as _Select, SelectProps } from '@material-ui/core/Select';
export const Select: React.SFC<SelectProps & { ref }> = _Select as any;

import { default as _Radio, RadioProps } from '@material-ui/core/Radio';
export const Radio: React.SFC<RadioProps> = _Radio as any;

import { default as _RadioGroup, RadioGroupProps } from '@material-ui/core/RadioGroup';
export const RadioGroup: React.SFC<RadioGroupProps & { ref }> = _RadioGroup as any;

import { default as _Tab, TabProps } from '@material-ui/core/Tab';
export const Tab: React.SFC<TabProps> = _Tab as any;

import { default as _Tabs, TabsProps } from '@material-ui/core/Tabs';
export const Tabs: React.SFC<TabsProps> = _Tabs as any;

import { default as _Paper, PaperProps } from '@material-ui/core/Paper';
export const Paper: React.SFC<PaperProps> = _Paper as any;

import { SnackbarContentProps, default as _SnackbarContent } from '@material-ui/core/SnackbarContent';
export const SnackbarContent: React.SFC<SnackbarContentProps> = _SnackbarContent as any;

import { default as _DialogTitle, DialogTitleProps } from '@material-ui/core/DialogTitle';
export const DialogTitle: React.SFC<DialogTitleProps> = _DialogTitle as any;
import { default as _Dialog, DialogProps } from '@material-ui/core/Dialog';
export const Dialog: React.SFC<DialogProps> = _Dialog as any;

import { default as _DialogContent, DialogContentProps } from '@material-ui/core/DialogContent';
export const DialogContent: React.SFC<DialogContentProps> = _DialogContent as any;
import { default as _DialogActions, DialogActionsProps } from '@material-ui/core/DialogActions';
export const DialogActions: React.SFC<DialogActionsProps> = _DialogActions as any;

import { default as _IconButton, IconButtonProps } from '@material-ui/core/IconButton';
export const IconButton: React.SFC<IconButtonProps> = _IconButton as any;

import { default as _FormControlLabel, FormControlLabelProps } from '@material-ui/core/FormControlLabel';

export const FormControlLabel: React.SFC<FormControlLabelProps> = _FormControlLabel as any;
import _Menu, { MenuProps } from '@material-ui/core/Menu';
export const Menu: React.SFC<MenuProps> = _Menu as any;

import _MenuItem, { MenuItemProps } from '@material-ui/core/MenuItem';
export const MenuItem: React.SFC<MenuItemProps> = _MenuItem as any;

import _Popover, { PopoverProps } from '@material-ui/core/Popover';
export const Popover: React.SFC<PopoverProps> = _Popover as any;

import _GridList, { GridListProps } from '@material-ui/core/GridList';
export const GridList: React.SFC<GridListProps> = _GridList as any;
import _GridListTile, { GridListTileProps } from '@material-ui/core/GridListTile';
export const GridListTile: React.SFC<GridListTileProps> = _GridListTile as any;

//----------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------

export { Callout } from 'office-ui-fabric-react/lib/Callout';
export { Icon } from 'office-ui-fabric-react/lib/Icon';
export { DetailsList } from 'office-ui-fabric-react/lib/DetailsList';
export { MessageBar } from 'office-ui-fabric-react/lib/MessageBar';
export { Fabric } from 'office-ui-fabric-react/lib/Fabric';
export { Modal } from 'office-ui-fabric-react/lib/Modal';
export { FocusZone } from 'office-ui-fabric-react/lib/FocusZone';

import Swal from 'sweetalert2'
import * as withReactContent from 'sweetalert2-react-content'
import { i18n } from '../core/shared-vars';
const alertWrapper = (withReactContent as any)(Swal);
export const Alert = (options: withReactContent.ReactSweetAlertOptions) => new alertWrapper(Object.assign({
    confirmButtonText: i18n.get('okey'),
    cancelButtonText: i18n.get('cancel')
} as withReactContent.ReactSweetAlertOptions,
    options,
    options.text ? { text: i18n.get(  options.text) } : {})); 