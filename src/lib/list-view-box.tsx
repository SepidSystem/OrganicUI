/// <reference path="../organicUI.d.ts" />

import { BaseComponent, CriticalContent } from './base-component';
import { icon, i18n } from './shared-vars';
import { Utils } from './utils';
import { FilterPanel } from './filter-panel';
import { listViews } from './shared-vars';
import { ReactElement } from 'react';
import { IDataListProps, DataList } from './data-list';

import { Spinner } from './spinner';
import { AdvButton, Placeholder } from './ui-kit';

import { IDetailsListProps, Selection } from 'office-ui-fabric-react';
import OrganicBox from './organic-box';
import { Field, IFieldProps } from './data';
import PrintIcon from '@material-ui/icons/Print';
import EditIcon from '@material-ui/icons/Edit';
import AddIcon from '@material-ui/icons/Add';
import SearchIcon from '@material-ui/icons/Search';

import DeleteIcon from '@material-ui/icons/Delete';
import { AppUtils } from './app-utils';
const { OverflowSet, SearchBox, DefaultButton, css } = FabricUI;

export interface TemplateForCRUDProps extends React.Props<any> {
    id: string;
    mode: 'single' | 'list';
}
let debounceTimer: any;
const debounce = cb => {
    debounceTimer && clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => (debounceTimer = null, cb()), 100);
}

function storeToggleButtons(v) {

}


export class OverflowSetForListView extends BaseComponent<{ listView: ListViewBox<any> }, any> {

    public render() {
        return (
            <OverflowSet

                items={[
                    {
                        key: 'newItem',
                        name: 'Add',
                        icon: 'Add',
                        ariaLabel: 'New. Use left and right arrow keys to navigate',
                        onClick: () => Utils.navigate(this.props.listView.getUrlForSingleView('new'))

                    },
                    {
                        key: 'edit',
                        name: 'Edit',
                        icon: 'Edit',
                        onClick: () => this.props.listView.handleEdit(),
                    },
                    {
                        key: 'delete',
                        name: 'Delete',
                        icon: 'Delete',
                        onClick: () => this.props.listView.repatch({ deleteDialogIsOpen: true })
                    }
                ]}
                overflowItems={
                    Array.from({ length: 4 }, (_, idx) => ({
                        key: 'newItem',
                        name: 'Action#1',
                        icon: 'Add',
                        ariaLabel: 'New. Use left and right arrow keys to navigate',
                        onClick: () => { return; }
                    }))

                }
                onRenderOverflowButton={this._onRenderOverflowButton}
                onRenderItem={this._onRenderItem}
            />
        );
    }

    private _onRenderItem(item): JSX.Element {
        if (item.onRender) {
            return (
                item.onRender(item)
            );
        }
        /* iconProps={{ iconName: item.icon }}
                        menuProps={item.subMenuProps}
                       */
        return (
            <AdvButton onClick={item.onClick}    >{i18n(OrganicUI.changeCase.paramCase(item.name))}</AdvButton>
        );
    }

    private _onRenderOverflowButton(overflowItems: any[] | undefined): JSX.Element {
        return (
            <DefaultButton
                menuIconProps={{ iconName: 'More' }}
                menuProps={{ items: overflowItems! }}
            />
        );
    }
}

interface ListViewBoxProps {
    options?: IOptionsForCRUD;
    params: IListViewParams;
    actions: IActionsForCRUD<any>, children;

};
interface ListViewBoxState<T> { dataFormForFilterPanel: any; currentRow: T; deleteDialogIsOpen?: boolean; };

export class ListViewBox<T> extends
    OrganicBox<IActionsForCRUD<T>, IOptionsForCRUD, IListViewParams, ListViewBoxState<T>>
    implements IDeveloperFeatures {

    columns: IFieldProps[];

    getFilterPanel() {
        this.columns = this.columns || this.getColumns();
        return <FilterPanel onApplyClick={()=>this.refs.dataList.reload()} dataForm={this.state.dataFormForFilterPanel}>
            {this.columns.map(col => (<Field  {...col} />))}
        </FilterPanel>
    }
    selection: Selection;
    refs: {
        dataList: DataList;
        root: HTMLElement;
    }
    getMultiple() {
        const { params } = this.props;
        return params.multipleDataLookup || !params.forDataLookup;
    }
    constructor(p) {
        super(p);
        this.handleSelectionChanged = this.handleSelectionChanged.bind(this);
        this.handleReadList = this.handleReadList.bind(this);
        this.selection = new FabricUI.Selection({
            selectionMode: this.getMultiple() ? FabricUI.SelectionMode.multiple : FabricUI.SelectionMode.single,
            onSelectionChanged: this.handleSelectionChanged
        });
        this.state.dataFormForFilterPanel = this.state.dataFormForFilterPanel || {};
        this.handleEdit = this.handleEdit.bind(this);
        this.handleRemove = this.handleRemove.bind(this);
        this.handleLoadRequestParams = this.handleLoadRequestParams.bind(this);
    }
    getColumns(): IFieldProps[] {
        const dataList = React.Children.map(this.props.children || [], (child: any) => child && child.type == DataList && !child.props.loader && child)[0] as React.ReactElement<DataList>;
        if (!dataList) return;
        const { children } = dataList.props as IDataListProps;
        return React.Children.map(children || [], (child: any) => child && child.type == Field && child).filter(x => !!x).map(c => c.props)

    }
    getUrlForSingleView(id) {
        return this.props.options.routeForSingleView.replace(':id', id);
    }
    getDevButton() {
        return Utils.renderDevButton('ListView', this)
    }
    handleEdit() {
        const indices = this.selection.getSelectedIndices();
        const index = indices[0];
        const row = (this.selection.getItems()[index]);
        const id = this.getId(row);
        const url = this.getUrlForSingleView(id);
        return OrganicUI.renderViewToComplete(url).then(() => Utils.navigate(url));
    }
    async handleRemove() {
        const indices = this.selection.getSelectedIndices();
        const allItems = this.selection.getItems() as T[];
        const items = indices.map(index => allItems[index]).filter(x => !!x) as T[];
        const { actions } = this.props;

        const confrimResult = await AppUtils.confrim(<div>
            {actions.getText instanceof Function && <ul>
                {items.map(item => <li>{actions.getText(item)}</li>)}
            </ul>}
        </div>, { title: "delete-items" });
        if (!confrimResult) return;
        items.map(dto => this.getId(dto)).forEach(id => actions.handleDeleteList(id));

        this.refs.dataList.reload();
    }
    getId(row) {
        const s = this.state;
        if (this.actions.getId instanceof Function)
            return this.actions.getId(row);
        return Utils.defaultGetId(row);
    }
    denyHandleSelectionChanged: boolean;
    handleSelectionChanged() {
        if (this.denyHandleSelectionChanged) return;

        const { onSelectionChanged } = this.props.params;
        const indices = this.selection.getSelectedIndices();
        onSelectionChanged instanceof Function && onSelectionChanged(indices, this.selection);
        onSelectionChanged instanceof Function &&
            setTimeout(() => {
                this.denyHandleSelectionChanged = true;
                try {
                    if (indices.length)
                        indices.forEach(idx => this.selection.setIndexSelected(idx, true, false))
                } finally {
                    this.denyHandleSelectionChanged = false;
                }
            }, 20);
        //this.repatch({});
    }
    handleReadList(params) {
        if (this.isRootRender()) {
            return this.actions.handleReadList(params).then(r => {
                setTimeout(() => this.adjustSelectedRow(), 200);
                return r;
            });
        }
        else {
            return Promise.resolve({ rows: [], totalRows: 0 });
        }
    }
    animateCheckmark() {
        let limitTry = 30;
        const tryToAnimate = () => {
            const elements = Array.from(document.querySelectorAll('.ms-DetailsRow.is-selected .ms-DetailsRow-cellCheck'));
            if (!elements.length && limitTry-- > 0) {
                setTimeout(tryToAnimate.bind(this), 50);
            }
            elements.forEach(element => element.classList.add('animated', 'tada'));
        }
        tryToAnimate();
    }
    adjustSelectedRow() {
        const { selectedId } = this.props.params;
        let limitTry = 30;
        this.denyHandleSelectionChanged = true;
        if (selectedId) {
            const tryToSelect = () => {
                const items = this.selection.getItems();
                let found = false;

                items.forEach((item, idx) => {
                    if (!item) return;
                    if (found) return;
                    found = this.getId(item) == selectedId;
                    found && setTimeout(() => this.selection.setIndexSelected(idx, true, false), 100);
                });
                if (!found && --limitTry > 0) setTimeout(() => tryToSelect(), 200);
                else {
                    this.denyHandleSelectionChanged = false;

                }
            }
            tryToSelect();
        }
    }

    componentDidMount() {
        super.componentDidMount();
        this.setPageTitle(i18n.get(this.props.options.pluralName));

    }
    handleLoadRequestParams(params: IAdvancedQueryFilters) {
        const filterPanel=this.querySelectorAll<FilterPanel>('.filter-panel')[0];
        params.filterModel = filterPanel.getFilterItems().filter(filterItem=>!!filterItem.value);
        return params; 
    }
    renderContent() {
        if ((React.Children.map(this.props.children || [], child => child) || [])
            .filter((child: any) => !!child && child.type == DataList && !child.props.loader)
            .length == 0) return this.renderErrorMode(`${this.props.options.pluralName} listView is invalid`, 'add data-list as children');
        const { repatch } = this;
        const queryNames = [];
        const onRowClick = (rowIdx, currentRow) => {

            //     currentRow && TemplateForCRUD.Instance && TemplateForCRUD.Instance.repatch({ currentRow })
        }
        const onRowSelect = ([currentRow]) => onRowClick(null, currentRow);
        const { options, params } = this.props;
        const { corner } = params;

        const s = this.state as any;
        s.toggleButtons = s.toggleButtons || {};
        const { root } = this.refs;
        const filterPanel = this.props.children && (React.Children.map(this.props.children, (child: any) => child.type == FilterPanel && child).filter(x => !!x)[0]) || this.getFilterPanel();
        const multiple = this.getMultiple();
        let hasDataList = false;
        const children = !!root && React.Children.map(this.props.children || [], (child: any) => {
            if (child.type == FilterPanel) return null;
            if (child.type == DataList && !child.props.loader) {
                hasDataList = true;
                return React.cloneElement(child, Object.assign(
                    {}, child.props, {
                        ref: "dataList",
                        height: params.height || 500,
                        onDoubleClick: this.handleEdit,
                        onLoadRequestParams: this.handleLoadRequestParams,
                        loader: this.handleReadList,
                        paginationMode: child.props.paginationMode || 'paged',
                        selection: this.selection
                    } as Partial<IDataListProps>,

                    { corner } as Partial<IDataListProps>,
                    multiple
                        ? {
                            selectionMode: 2, checkboxVisibility: 1
                        } as Partial<IDetailsListProps>
                        : {} as Partial<IDetailsListProps>));
            }
            return child;
        });

        if (!root) setTimeout(() => this.repatch({}), 10);
        if (params.forDataLookup) return <section className="developer-features list-view-data-lookup" ref="root"  > {children}</section>;

        return <section className="list-view developer-features" ref="root"   >

            {/*!!s.toggleButtons.showFilter && <Card header={"data-filter"} actions={['clear']}>
            </Card>*/}
            <div className="title is-5">
                {Utils.i18nFormat('list-view-title-fmt', this.props.options.pluralName)}
            </div>
            <header className="  static-height list-view-header"  >
                {filterPanel}

                <CriticalContent permissionKey="create-permission">
                    <AdvButton color="primary" variant="raised" onClick={() => Utils.navigate(options.routeForSingleView.replace(':id', 'new'))} className="insert-btn" >
                        <i className="fa fa-plus flag" key="flag" />
                        <div className="content" key="content">
                            {[!!options.iconCode && <i key="iconCode" className={Utils.classNames(options.iconCode.split('-')[0], options.iconCode)} />,
                            <div key="addText" className="add-text">{Utils.i18nFormat('new-entity-fmt', options.singularName)}</div>].filter(x => !!x)}


                        </div>
                    </AdvButton>
                </CriticalContent>
                <CriticalContent permissionKey="view-permission" />
                <CriticalContent permissionKey="edit-permission" />
                <CriticalContent permissionKey="delete-permission" />
                <CriticalContent permissionKey="copy-permission" />
                <CriticalContent permissionKey="archive-permission" />
                <CriticalContent permissionKey="trash-permission" />
                <div className="buttons"  >
                    <MaterialUI.Button   >
                        <PrintIcon />
                        {i18n('export')}
                    </MaterialUI.Button>

                </div>
            </header>
            <div className=" " key="cats">
                {s.toggleButtons.showCats && <div className="column is-4">
                    <div className="tags is-vcentered">
                        <span className="tag ">
                            {'  '}World{'  '}
                            <button className="delete is-small"></button>
                        </span>
                    </div>
                    <div className="select" style={{ width: '49%', marginBottom: '4px' }}>
                        <select className="" style={{ width: '100%' }}>
                            {['area', 'earned', 'payment', ''].map(s => <option className="">{s}</option>)}

                        </select>

                    </div>{' '}
                    <div className="select" style={{ width: '49%', marginBottom: '4px' }}>
                        <select className="" style={{ width: '100%' }}>
                            {['SUM', 'MAX', 'MIN', 'AVG'].map(s => <option className="">{s}</option>)}

                        </select>

                    </div>

                </div>}
                <br />
                <MaterialUI.Paper className="  main-content column  "   >

                    <header>
                        <MaterialUI.Button onClick={this.handleEdit} >
                            <EditIcon />
                            {i18n('edit')}
                        </MaterialUI.Button>
                        <MaterialUI.Button onClick={this.handleRemove}   >
                            <DeleteIcon />
                            {i18n('delete-items')}

                        </MaterialUI.Button>
                    </header>
                    {!!this.refs.root && children}

                </MaterialUI.Paper>
            </div>

            <br />
            {!!this.state.deleteDialogIsOpen && <FabricUI.Dialog isOpen={true} onDismiss={() => this.repatch({ deleteDialogIsOpen: false })}>
                <FabricUI.DialogFooter>
                    sdf
                    </FabricUI.DialogFooter>
            </FabricUI.Dialog>}
            <footer style={{ display: 'none', position: 'fixed', bottom: '40px', right: '340px' }}>
                <MaterialUI.Button variant="fab" color="secondary" >
                    <AddIcon />
                </MaterialUI.Button>{' '}
                <MaterialUI.Button variant="fab" color="secondary" >
                    <SearchIcon />
                </MaterialUI.Button>
            </footer>

        </section >;
    }

}
