import { BaseComponent } from "./base-component";
import { i18n } from "./shared-vars";
import { Utils } from "./utils";
import { Dialog, DialogTitle, DialogContent, DialogActions } from '../controls/inspired-components';

import { ReactElement, cloneElement } from "react";

interface IDialogProps {
    title?, content?: any;
    actions?: { [key: string]: Function }
    defaultValues?: any;
    noClose?: boolean;
    hasScrollBar?: boolean;
}
export class AppUtils extends BaseComponent<any, any>{
    static Instance: AppUtils
    static dialogInstance: IDialogProps;
    static closeDialog() {
        AppUtils.showDialog(null);
    }
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
            {<Dialog open={!!dialogInstance} onClose={this.handleClose}  >
                <DialogTitle>
                    <div style={{ display: 'flex' }}>
                        <div style={{ flex: '10' }}>
                            {i18n((dialogInstance && dialogInstance.title))}
                        </div>
                        {!(dialogInstance && dialogInstance.noClose) && <a href="#" className="close-dialog" onClick={e => {
                            e.preventDefault();
                            AppUtils.showDialog(null);
                        }}><i className="fa fa-times" /></a>}
                    </div>
                </DialogTitle>

                <DialogContent style={{ overflow: dialogInstance && dialogInstance.hasScrollBar ? null : 'hidden' }}>
                    {dialogInstance && dialogInstance.content}
                </DialogContent>
                <DialogActions>
                    {dialogInstance && dialogInstance.actions && Utils.renderButtons(dialogInstance.actions)}
                </DialogActions>
            </Dialog>}
        </section>
    }
    static afterREST({ method, url, data, result }) {
        return result;
    }
} 