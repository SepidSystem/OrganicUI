import { BaseComponent } from "./base-component";
import { i18n } from "./shared-vars";
import { Utils } from "./utils";
import { Dialog, DialogTitle, DialogContent, DialogActions } from './inspired-components';

import { ReactElement, cloneElement } from "react";

interface IDialogProps {
    title?, content?: any;
    actions?: { [key: string]: Function }
    defaultValues?: any;
    noClose?: boolean;
}
export class AppUtils extends BaseComponent<any, any>{
    static Instance: AppUtils
    static dialogInstance: IDialogProps;
    static showDialog(content, opts?: IDialogProps) {
        AppUtils.dialogInstance = content && Object.assign({ content }, opts || {});
        AppUtils.Instance && AppUtils.Instance.forceUpdate();
    }
    static confrim(content, opts?: IDialogProps) {
        opts = opts || {} as any;
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
            AppUtils.showDialog(content, opts);
        });
    }
    static confrimActionByUser(p: { actionName: string, actionData }): Promise<never> {
        return Promise.resolve(true as never);
    }
    static showDataDialog<T>(content: ReactElement<Partial<OrganicUi.IDataFormProps<T>>>, opts?: IDialogProps): Promise<T> {
        return new Promise((resolve, reject) => {
            opts = opts || {} as any;
            let data: T = opts.defaultValues || {} as any;
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
            content = cloneElement(content, { onFieldWrite: (key, value) => data[key] = value, onFieldRead: key => data[key] });
            AppUtils.showDialog(content, opts);
        });
    }
    handleClose() {
        AppUtils.dialogInstance = null;
        this.repatch({});
    }
    renderContent() {
        AppUtils.Instance = this;
        const { dialogInstance } = AppUtils;
        return <section className="app-utils" >
            {dialogInstance && <Dialog open={true} onClose={this.handleClose}  >
                {dialogInstance.title && <DialogTitle> {i18n(dialogInstance.title)}</DialogTitle>}
                {!dialogInstance.noClose && <a href="#" className="close-dialog" onClick={e => {
                    e.preventDefault();
                    AppUtils.showDialog(null);
                }}><i className="fa fa-times" /></a>}
                <DialogContent style={{ overflowX: 'hidden' }}>
                    {dialogInstance.content}
                </DialogContent>
                {dialogInstance.actions && <DialogActions>
                    {Utils.renderButtons(dialogInstance.actions)}
                </DialogActions>}
            </Dialog>}
        </section>
    }
    static afterREST({ method, url, data, result }) {
        return result;
    }
} 