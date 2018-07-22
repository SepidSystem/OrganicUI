/// <reference path="../dts/globals.d.ts" />

import { BaseComponent, CriticalContent } from './base-component';
import { icon, i18n } from './shared-vars';
import { Utils, changeCase } from './utils';
import { FilterPanel } from './filter-panel';

import { DataList } from './data-list';
import { Selection, IDetailsListProps } from 'office-ui-fabric-react/lib/DetailsList'

import { AdvButton, Placeholder } from './ui-kit';


import OrganicBox from './organic-box';
import { Field } from './data';

import { AppUtils } from './app-utils';
import { IOptionsForCRUD, IActionsForCRUD, IListViewParams, IDeveloperFeatures, IFieldProps } from '@organic-ui';
import { createClientForREST } from './rest-api';
import { PrintIcon, DeleteIcon, EditIcon, SearchIcon, AddIcon } from './icons';
import { SelectionMode } from 'office-ui-fabric-react/lib-es2015/DetailsList';
import { Button, Paper, TextField } from './inspired-components';

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



interface ListViewBoxState<T> { dataFormForFilterPanel: any; currentRow: T; deleteDialogIsOpen?: boolean; };

export class ListViewBox<T> extends
    OrganicBox<IActionsForCRUD<T>, IOptionsForCRUD, IListViewParams, ListViewBoxState<T>>
    implements IDeveloperFeatures {

    columns: IFieldProps[];
    static fakeLoad() {
        const date = (Utils['scaningAllPermission'] && +Utils['scaningAllPermission']) || 0;
        return ((+ Date()) - date < 500);
    }

    getFilterPanel() {
        this.columns = this.columns || this.getColumns();
        return <FilterPanel onApplyClick={() => this.refs.dataList.reload()} dataForm={this.state.dataFormForFilterPanel}>
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
        this.readList = this.readList.bind(this);
        this.selection = new Selection({
            selectionMode: this.getMultiple() ? SelectionMode.multiple : SelectionMode.single,
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
        const { children } = dataList.props as OrganicUi.IDataListProps;
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
        return Utils.navigate(url);
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
        items.map(dto => this.getId(dto)).forEach(id => actions.deleteList(id));

        this.refs.dataList.reload();
    }
    getId(row) {
        const s = this.state;
        if (this.actions.getId instanceof Function)
            return this.actions.getId(row);
        return Utils.defaultGetId(row);
    }
    denyHandleSelectionChanged: number;

    handleSelectionChanged() {

        const now = +new Date();
        if (this.denyHandleSelectionChanged && (now - this.denyHandleSelectionChanged) < 500) return;
        const { onSelectionChanged } = this.props.params;
        const indices = this.selection.getSelectedIndices();
        onSelectionChanged instanceof Function && onSelectionChanged(indices, this.selection);
        onSelectionChanged instanceof Function &&
            setTimeout(() => {

                this.denyHandleSelectionChanged = +new Date();
                try {
                    if (indices.length)
                        indices.forEach(idx => this.selection.setIndexSelected(idx, true, false))
                } finally {
                    this.denyHandleSelectionChanged = 0;
                }

                this.adjustSelectedRow();

            }, 20);
        //this.repatch({});
    }
    static fetchFail: Function;
    static fetchFailSuppressDate: number;
    requestIsFail: boolean;
    readList(params) {
        if (!ListViewBox.fakeLoad() && !this.requestIsFail) {
            return this.actions.readList(params).then(r => {
                setTimeout(() => this.adjustSelectedRow(), 200);
                return r;
            }, error => {
                this.requestIsFail=true;
                this.devElement = this.makeDevElementForDiag(error);
                this.repatch({})

            });
        }
        else {
            return Promise.resolve({ rows: [], totalRows: 0 });
        }
    }
    makeDevElementForDiag(error) {
        const now = +new Date();

        if (ListViewBox.fetchFailSuppressDate && (now < ListViewBox.fetchFailSuppressDate))
            return null;
        if (!ListViewBox.fetchFail) return null;
        return ListViewBox.fetchFail(Object.assign({}, createClientForREST['lastRequest'] || {}, {
            error, result: error,
            onProceed: () => (ListViewBox.fetchFailSuppressDate = +new Date() + 3000, this.devElement = null, this.repatch({}))
        }))
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

        const { params } = this.props;

        const { selectedId } = params;
        let limitTry = 30;
        if (selectedId || params.defaultSelectedValues) {
            const defaultSelectedValues =
                params.defaultSelectedValues instanceof Function ?
                    params.defaultSelectedValues() : [];
            const tryToSelect = () => {
                const items = this.selection.getItems();
                let foundIndex = -1;
                items.forEach((item, idx) => {
                    if (!item) return;
                    const id = this.getId(item);
                    if (id == selectedId)
                        foundIndex = idx;
                    if (defaultSelectedValues.includes(id))
                        foundIndex = idx;
                    (foundIndex >= 0) && setTimeout(foundIndex => {
                        this.denyHandleSelectionChanged = +new Date();

                        this.selection.setIndexSelected(foundIndex, true, false);
                        this.denyHandleSelectionChanged = 0;
                    }, 100, foundIndex);
                });
                if ((foundIndex < 0) && --limitTry > 0) setTimeout(() => tryToSelect(), 200);

            }
            tryToSelect();
        }

    }

    componentDidMount() {
        super.componentDidMount();
        !this.props.params.forDataLookup && this.setPageTitle(i18n.get(this.props.options.pluralName));

    }
    handleLoadRequestParams(params: OrganicUi.IAdvancedQueryFilters) {
        const filterPanel = this.querySelectorAll<FilterPanel>('.filter-panel')[0];
        if (filterPanel)
            params.filterModel = filterPanel.getFilterItems().filter(filterItem => !!filterItem.value);
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
                        onDoubleClick: this.props.params.forDataLookup ? null : this.handleEdit,
                        onLoadRequestParams: this.handleLoadRequestParams,
                        loader: this.readList,
                        paginationMode: child.props.paginationMode || 'paged',
                        selection: this.selection,

                    } as Partial<OrganicUi.IDataListProps>,

                    //    { corner } as Partial<IDataListProps>,
                    multiple
                        ? {
                            selectionMode: 2, checkboxVisibility: 1
                        } as Partial<IDetailsListProps>
                        : {} as Partial<IDetailsListProps>));
            }
            return child;
        });

        if (!root) setTimeout(() => (this.repatch({})), 10);
        if (params.forDataLookup)
            return <section className="developer-features list-view-data-lookup"
                style={{ maxHeight: (params.height ? params.height + 'px' : 'auto'), overflowY: 'scroll' }} ref="root"  > {children}</section>;

        return <section className="list-view developer-features" ref="root"   >

            {/*!!s.toggleButtons.showFilter && <Card header={"data-filter"} actions={['clear']}>
            </Card>*/}
            <div className="title is-3">
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
                    <Button   >
                        <PrintIcon />
                        {i18n('export')}
                    </Button>

                </div>
            </header>

            <Paper className="  main-content column  "   >

                <header className="navigator">
                    <Button onClick={this.handleEdit} >
                        <EditIcon />
                        {i18n('edit')}
                    </Button>
                    <Button onClick={this.handleRemove}   >
                        <DeleteIcon />
                        {i18n('delete-items')}

                    </Button>
                    <div className="search-field">
                        <SearchIcon width="64px" height="64px" />
                        <TextField />
                    </div>
                </header>
                {!!this.refs.root && children}

            </Paper>


            <br />

            <footer style={{ display: 'none', position: 'fixed', bottom: '40px', right: '340px' }}>
                <Button variant="fab" color="secondary" >
                    <AddIcon />
                </Button>{' '}
                <Button variant="fab" color="secondary" >
                    <SearchIcon />
                </Button>
            </footer>

        </section >;
    }

}
