import { TextField, Dialog, DialogActions, Button, DialogTitle, DialogContent } from '../controls/inspired-components';
import { BaseComponent } from '../core/base-component';

import { Utils } from '../core/utils';
import { i18n } from '../core/shared-vars';
import { SelfBind } from '../core/decorators';
import { Menu, MenuItem } from '@material-ui/core';
import { ListViewBox } from '../templated-views/list-view-box';
import swal from 'sweetalert2';
import { AppUtils } from '../core/app-utils';
import { Spinner } from '../core/spinner';
import { DataList } from '../data/data-list';

export class DataLookupModal extends BaseComponent<OrganicUi.IDataLookupPopupModeProps, any>  {

    handleToggleMenuClick(e: React.MouseEvent<HTMLElement>) {
        this.repatch({ anchorEl: e.currentTarget });
    }
    handleClearSelection() {

    }
    async handleShowAll() {
        const dataLists = this.querySelectorAll('.data-list-wrapper') as DataList[];
        if (dataLists.length == 0) throw 'dataList not found';
        const [dataList] = dataLists;
        dataList.state.startFrom = 0;
        dataList.rowCount = 100 * 1000;
        AppUtils.showDialog(<Spinner />, { noClose: true });
        try {
            const result = await dataList.reload();
            console.assert(Boolean(result), 'result is invalid');
        }
        finally {
            AppUtils.closeDialog();
        }
    }
    render() {
        const p = this.props;
        const children = React.cloneElement(React.Children.only(p.children), { height: 460, filterMode: 'advanced', noTitle: true });
        const options = children && children.type && children.type['dataLookupOptions'];
        const { anchorEl } = this.state;
        return <Dialog open={p.isOpen} onClose={() => {
            p.onClose && p.onClose();
            document.documentElement.classList.remove('overflowY-hidden');
        }}

        >
            {options && <DialogTitle>
                <header style={{ display: 'flex' }}>
                    <div className="  title is-2" style={{ flex: 1 }}>
                        {i18n(options.pluralName)}
                    </div>
                    <div style={{ minWidth: '4rem' }}>
                        <Button style={{ maxWidth: 30, minWidth: 30 }} onClick={this.handleToggleMenuClick.bind(this)} >
                            {Utils.showIcon('fa-ellipsis-v')}
                        </Button>
                        <Menu
                            id="simple-menu"
                            anchorEl={anchorEl}
                            open={!!(anchorEl)}
                            onClose={() => this.repatch({ anchorEl: null })}
                        >
                            <MenuItem onClick={this.handleShowAll.bind(this)}>{i18n('show-all')}</MenuItem>

                        </Menu>
                    </div>
                </header>
            </DialogTitle>}
            <DialogContent className="content" style={{ minWidth: '1000px', width: '1000px', maxWidth: '1000px', minHeight: '470px' }} >
                <section ref="root">
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