import { BaseComponent } from "./base-component";
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import Button from '@material-ui/core/Button';
import { Utils } from "./utils";
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import { ReactElement, cloneElement } from "react";
import { i18n } from "./shared-vars";

interface IDialogProps {
    title?, content?: any;
    actions?: { [key: string]: Function }
    defaultValues?:any;
}
export class AppUtils extends BaseComponent<any, any>{
    static Instance: AppUtils
    static dialogInstance: IDialogProps;
    static showDialog(content, opts?: IDialogProps) {
        AppUtils.dialogInstance = content && Object.assign({ content }, opts || {});
        AppUtils.Instance.forceUpdate();
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
    static showDataDialog<T>(content: ReactElement<Partial<IDataFormProps<T>>>, opts?: IDialogProps): Promise<T> {
        return new Promise((resolve, reject) => {
            opts = opts || {} as any;
            let data: T = opts.defaultValues||  {} as any;
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
            content = cloneElement(content, {  onFieldWrite: (key, value) => data[key] = value, onFieldRead: key => data[key] });
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
                <DialogContent>
                    {dialogInstance.content}
                </DialogContent>
                {dialogInstance.actions && <DialogActions>
                    {Utils.renderButtons(dialogInstance.actions)}
                </DialogActions>}
            </Dialog>}
        </section>
    }
    static  afterREST({ method,url,data,result  }) {
        return result;
    }
} 