import { BaseComponent } from "./base-component";
import { i18n } from "./shared-vars";
import { Utils } from "./utils";
import { Dialog, DialogTitle, DialogContent, DialogActions } from '../controls/inspired-components';

import { ReactElement, cloneElement } from "react";
import { Modal } from "../controls/modal";
import { SelfBind } from "../core/decorators";
import { TipsBar } from "../controls/tip-bar";

interface IDialogProps {
    title?, content?: any;
    actions?: { [key: string]: Function }
    defaultValues?: any;
    noClose?: boolean;
    hasScrollBar?: boolean;
    onClose?: Function;
    disableEscapeKeyDown?: boolean;
}
export class AppUtils extends BaseComponent<any, any>{
    static Instance: AppUtils
    static dialogInstance: IDialogProps;
    static networkError: IDialogProps;
    static tips: any[] = [];
    static closeDialog() {
        AppUtils.showDialog(null);
    }
    static showDialog(content, opts?: IDialogProps) {
        AppUtils.dialogInstance = content && Object.assign({ content }, opts || {}) as any;
        AppUtils.Instance && AppUtils.Instance.forceUpdate();
    }
    static confrim(content, opts?: IDialogProps) {
        opts = { ...(opts || {}) } as IDialogProps;
        content = typeof content == 'string' ? i18n(content) : content;
        return new Promise((resolve, reject) => {
            opts.actions = {
                yes() {
                    resolve(true);
                    AppUtils.showDialog(null);
                }, no() {
                    reject();
                    AppUtils.showDialog(null);
                }
            }
            AppUtils.showDialog(<div className="confrim-content">{content}</div>, opts);
        });
    }
    static confrimActionByUser(p: { actionName: string, actionData }): Promise<never> {
        return Promise.resolve(true as never);
    }
    static showDataDialog<T>(content: ReactElement<Partial<OrganicUi.IDataFormProps<T>>>, opts?: IDialogProps): Promise<T> {
        return new Promise((resolve, reject) => {
            opts = { onClose: reject, ...(opts || {}) } as IDialogProps;

            let data: T = Object.assign(
                content.props && content.props.data || {}, opts.defaultValues || {} as any);
            opts.actions = {
                accept() {
                    AppUtils.showDialog(null);
                    resolve(data);
                },
                close() {
                    AppUtils.showDialog(null);
                    reject();
                }
            }
            content = cloneElement(content, { data });
            AppUtils.showDialog(content, opts);
        });
    }
    @SelfBind()
    handleClose() {
        AppUtils.dialogInstance.onClose instanceof Function &&
            AppUtils.dialogInstance.onClose();
        AppUtils.dialogInstance = null;
        this.repatch({});
    }
    renderContent() {
        AppUtils.Instance = this;
        return <div className="app-utils" style={{ width: '100%' }} >
            <TipsBar tips={AppUtils.tips} />
            {AppUtils.dialogInstance && this.renderUserDialog(AppUtils.dialogInstance)}
            {this.renderNetworkError(AppUtils.networkError)}

        </div>
    }
    handleCloseNetworkError() {
        AppUtils.networkError = null;
    }
    renderNetworkError(dialog: IDialogProps) {
        return !!dialog && <Modal title={dialog.title} onClose={this.handleCloseNetworkError} buttons={dialog.actions}  >
            {dialog.content}
        </Modal>
    }
    renderUserDialog(dialog: IDialogProps) {

        return <Dialog open={!!dialog} onClose={this.handleClose} disableBackdropClick={true} disableEscapeKeyDown={dialog.disableEscapeKeyDown} >
            {!!dialog && !!dialog.title && <DialogTitle>
                <div style={{ display: 'flex' }}>
                    <div style={{ flex: '10' }}>
                        {i18n((dialog && dialog.title))}
                    </div>
                    {(!dialog || !dialog.noClose) && <a href="#" className="close-dialog" onClick={e => {
                        e.preventDefault();
                        AppUtils.showDialog(null);
                    }}><i className="fa fa-times" /></a>}
                </div>
            </DialogTitle>}

            <DialogContent style={{ overflow: dialog && dialog.hasScrollBar ? null : 'hidden' }}>
                {dialog && dialog.content}
            </DialogContent>
            {dialog && dialog.actions && <DialogActions style={{ width: 'auto' }}>
                {Utils.renderButtons(dialog.actions)}
            </DialogActions>}
        </Dialog>
    }
    static afterREST({ method, url, data, result }) {
        return result;
    }
}

