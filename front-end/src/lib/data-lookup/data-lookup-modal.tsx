import { TextField, Dialog, DialogActions, Button, DialogTitle, DialogContent } from '../controls/inspired-components';
import { BaseComponent } from '../core/base-component';

 
import { i18n } from '../core/shared-vars';
 

export class DataLookupModal extends BaseComponent<OrganicUi.IDataLookupPopupModeProps, any>  {

    handleToggleMenuClick(e: React.MouseEvent<HTMLElement>) {
        this.repatch({ anchorEl: e.currentTarget });
    }
    handleClearSelection() {

    }


    render() {
        const p = this.props;
        const children = React.cloneElement(React.Children.only(p.children), { height: 460, filterMode: 'advanced', noTitle: true });
        const options = children && children.type && children.type['dataLookupOptions'];
        const { anchorEl } = this.state;
        return <Dialog open={p.isOpen} className="data-lookup-modal" onClose={() => {
            p.onClose && p.onClose();
            document.documentElement.classList.remove('overflowY-hidden');
        }}

        >
            {options && <DialogTitle>
                <div className="title is-2">
                    {i18n(options.pluralName)}
                </div>

            </DialogTitle>}
            <DialogContent className="content" style={{ minWidth: '1000px', width: '1000px', maxWidth: '1000px', minHeight: '520px',display:'flex',flexDirection:'column', paddingTop: 0, paddingBottom: 0 }} >
                <section ref="root" style={{display:'flex',flexDirection:'column',flex:1}}>
                    {children}
                </section>
            </DialogContent>
            <DialogActions>
                <div style={{ flex: 1 }}>{' '}</div>
                {p.dataLookupProps.appendMode && <Button style={{ maxWidth: 80, minWidth: 80 }} variant="flat" color="primary" onClick={p.onAppend as any}  >
                    {i18n('append-to-list')}
                </Button>}
                {!p.dataLookupProps.appendMode && <Button style={{ maxWidth: 80, minWidth: 80 }} variant="contained" color="primary" onClick={p.onApply as any}  >
                    {i18n('ok')}
                </Button>}
                <Button onClick={p.onClose as any}  >
                    {i18n('close')}
                </Button>

            </DialogActions>
        </Dialog>

    }
    static renderButtons = (p: OrganicUi.DataLookupProps, { onClick, onClose }) => (<Button
        className="data-lookup-action DDD"
        onClick={onClick}
        style={{ padding: '2px', minWidth: '30px', maxHeight: '25px', margin: '0 4px' }} color="primary">
        <i className="fa-ellipsis-h fa"></i>
    </Button>);

}