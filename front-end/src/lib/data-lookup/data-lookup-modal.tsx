import { TextField, Dialog, DialogActions, Button, DialogTitle, DialogContent } from '../controls/inspired-components';
import { BaseComponent } from '../core/base-component';

import { Utils } from '../core/utils';
import { i18n } from '../core/shared-vars';

export class DataLookupModal extends BaseComponent<OrganicUi.IDataLookupPopupModeProps, any>  {
    render() {
        const p = this.props;
        const children = React.cloneElement(React.Children.only(p.children), { height: 460, filterMode: 'advanced', noTitle: true });
        const options = children && children.type && children.type['dataLookupOptions'];
        return <Dialog open={p.isOpen} onClose={() => {
            p.onClose && p.onClose();
            document.documentElement.classList.remove('overflowY-hidden');
        }}

        >
            {options && <DialogTitle>
                <div className="  title is-2">
                    {i18n(options.pluralName)}
                </div>
            </DialogTitle>}
            <DialogContent className="content" style={{ minWidth: '900px', minHeight: '470px' }} >
                {children}
            </DialogContent>
            <DialogActions>

                {p.dataLookupProps.appendMode && <Button onClick={p.onAppend as any} color="primary">
                    {i18n('append-to-list')}
                </Button>}
                {!p.dataLookupProps.appendMode && <Button onClick={p.onApply as any} color="primary">
                    {i18n('ok')}
                </Button>}
                <Button onClick={p.onClose as any} >
                    {i18n('close')}
                </Button>
            </DialogActions>
        </Dialog>

    }
    static renderButtons = (p: OrganicUi.DataLookupProps, { onClick, onClose }) => (<Button onClick={onClick} style={{ padding: '2px', minWidth: '30px', maxHeight: '25px' }} color="primary">
        <i className="fa-ellipsis-h fa"></i>
    </Button>);

}