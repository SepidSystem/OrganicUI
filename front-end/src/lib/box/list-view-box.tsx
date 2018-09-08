/// <reference path="../../dts/globals.d.ts" />

import { BaseComponent, CriticalContent } from '../core/base-component';
import { icon, i18n } from '../core/shared-vars';
import { Utils, changeCase } from '../core/utils';
import { FilterPanel } from '../data/filter-panel';
import { DataList } from '../data/data-list';
import { Selection, IDetailsListProps } from 'office-ui-fabric-react/lib/DetailsList'
import { AdvButton, Placeholder } from '../core/ui-elements';


import OrganicBox from './organic-box';
import { Field } from '../data/field';

import { AppUtils } from '../core/app-utils';
import { IOptionsForCRUD, IActionsForCRUD, IListViewParams, IDeveloperFeatures, IFieldProps, StatelessListView } from '@organic-ui';
import { createClientForREST } from '../core/rest-api';
import { PrintIcon, DeleteIcon, EditIcon, SearchIcon, AddIcon } from '../controls/icons';
import { SelectionMode } from 'office-ui-fabric-react/lib/DetailsList';
import { Button, Paper, TextField } from '../controls/inspired-components';
import { SnackBar } from '../controls/snack-bar';
import { DeveloperBar } from '../core/developer-features';
import { reinvent } from '../reinvent/reinvent';
import * as printerIcon from '../../../icons/printer.svg';
export interface TemplateForCRUDProps extends React.Props<any> {
    id: string;
    mode: 'single' | 'list';
}
let debounceTimer: any;
const debounce = cb => {
    debounceTimer && clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => (debounceTimer = null, cb()), 100);
}


interface ListViewBoxState<T> {
    dataFormForFilterPanel: any;
    currentRow: T;
    readingList: boolean;
    deleteDialogIsOpen?: boolean;
    quickFilter: boolean;
};

export class ListViewBox<T> extends
    OrganicBox<IActionsForCRUD<T>, IOptionsForCRUD, IListViewParams, ListViewBoxState<T>>
    implements IDeveloperFeatures {
    devElement: any;
    devPortId: any;


    columns: IFieldProps[];
    error: any;
    static fakeLoad() {
        const date = (Utils['scaningAllPermission'] && +Utils['scaningAllPermission']) || 0;
        return ((+ Date()) - date < 500);
    }

    getFilterPanel() {
        this.columns = this.columns || this.getColumns();
        if (this.props && this.props.options && this.props.options.avoidAutoFilter) return undefined;
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

        this.state.dataFormForFilterPanel = this.state.dataFormForFilterPanel || {};
        this.handleEdit = this.handleEdit.bind(this);
        this.handleRemove = this.handleRemove.bind(this);
        this.handleLoadRequestParams = this.handleLoadRequestParams.bind(this);
        this.state.quickFilter = (this.props.params.filterMode != 'advanced');
    }
    autoCreatedDataList: any;
    static isTargetedDataList(dataList) {
        return dataList && dataList.type && dataList.type.isDataList && !dataList.props.loader;
    }
    getDataList() {
        const dataList = React.Children.toArray(this.props.children || []).filter(ListViewBox.isTargetedDataList)[0] as React.ReactElement<DataList>;
        if (!dataList)
            return this.autoCreatedDataList = this.autoCreatedDataList || React.createElement(DataList as any, {}, ...React.Children.toArray(this.props.children))

        return dataList;
    }
    getColumns(): IFieldProps[] {
        const dataList = this.getDataList();
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
        const { getSelectedKey } = this.selection as any;
        let id;
        if (!getSelectedKey) {
            const indices = this.selection.getSelectedIndices();
            const index = indices[0];
            const row = (this.selection.getItems()[index]);
            id = this.getId(row);
        }
        else
            id = getSelectedKey.apply(this.selection);
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

                //this.adjustSelectedRows();

            }, 20);
        //this.repatch({});
    }
    static fetchFail: Function;
    static fetchFailSuppressDate: number;
    readList(params) {
        if (!ListViewBox.fakeLoad()) {
            this.state.readingList = true;
            const readList = this.props.params.customReadList || this.actions.readList;
            return readList(...(this.props.params.customReadListArguments || [params])).then(r => {
                setTimeout(() => {
                    this.adjustSelectedRows();
                    this.state.readingList = false;
                }, 200);
                return r;
            }, error => {

                this.devElement = this.makeDevElementForDiag(error);
                return Promise.resolve({ rows: [], totalRows: 0 });
            });
        }
        else {
            return Promise.resolve({ rows: [], totalRows: 0 });
        }
    }
    makeDevElementForDiag(error) {
        if (!DeveloperBar.developerFriendlyEnabled) return null;
        const now = +new Date();
        this.error = error;
        this.repatch({});
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
    adjustSelectedRows() {

        const { params } = this.props;

        const { selectedId } = params;
        let limitTry = 30;
        if (selectedId || params.defaultSelectedValues) {
            const defaultSelectedValues =
                params.defaultSelectedValues instanceof Function ?
                    params.defaultSelectedValues() : (params.defaultSelectedValues || {});
            const items = this.selection.getItems();
            const selectedIds = items.map((item, index) => ({ index, id: this.getId(item) }))
                .filter(({ id }) => !!defaultSelectedValues[id]);
            setTimeout(() => {
                selectedIds.forEach(({ index }) => {
                    this.denyHandleSelectionChanged = +new Date();
                    this.selection.setIndexSelected(index, true, false);
                    this.denyHandleSelectionChanged = 0;
                });
            }, 100);


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
        if (window['debugHandleLoadRequestParams']) debugger;
        return params;
    }
    renderQuickFilter() {
        return [
            <i className="fa fa-search"></i>,
            <TextField fullWidth />,
            //  <i className="fa fa-bars" onClick={() => this.repatch({ quickFilter: false })}></i>,
        ]
    }
    prepareDataList(intialDataList: React.ReactElement<OrganicUi.IDataListProps>) {
        const multiple = this.getMultiple();

        const dataItemsElement = this.refs.root.querySelector('.data-items');
        if (!this.selection) {
            const SelectionClass: typeof Selection = (intialDataList.type as typeof DataList).getSelectionClass(intialDataList as any) as any;
            this.selection = new SelectionClass({
                selectionMode: this.getMultiple() ? SelectionMode.multiple : SelectionMode.single,
                onSelectionChanged: this.handleSelectionChanged
            });
        }
        return React.cloneElement(intialDataList, Object.assign(
            {}, intialDataList.props, {
                ref: "dataList",
                height: dataItemsElement ? dataItemsElement.clientHeight : this.props.params.height,
                onDoubleClick: this.props.params.forDataLookup ? null : this.handleEdit,
                onLoadRequestParams: this.handleLoadRequestParams,
                multiple: this.props.params.forDataLookup,
                loader: this.readList,
                flexMode: true,
                paginationMode: intialDataList.props.paginationMode || 'paged',
                selection: this.selection,

            } as Partial<OrganicUi.IDataListProps>,
            multiple
                ? {
                    selectionMode: 2, checkboxVisibility: 1
                } as Partial<IDetailsListProps>
                : {} as Partial<IDetailsListProps>));
    }
    renderContent() {
        const dataList = this.getDataList();

        if (!dataList) return this.renderErrorMode(`${this.props.options.pluralName} listView is invalid`, 'add data-list as children');
        const { repatch } = this;

        const { options, params } = this.props;

        const s = this.state as any;
        s.toggleButtons = s.toggleButtons || {};
        const { root } = this.refs;
        const filterPanel = this.props.children && (React.Children.map(this.props.children, (child: any) => !!child && (child.type == FilterPanel) && child).filter(x => !!x)[0]) || this.getFilterPanel();
        let dataListFound = false;
        const children = !!root &&
            React.Children.toArray(this.props.children).map((child: any) => {
                if (child && (child.type == FilterPanel)) return null;
                if (child && (child.type && child.type.isField)) return null;
                if (ListViewBox.isTargetedDataList(child)) {
                    dataListFound = true;
                    return this.prepareDataList(dataList);
                }
                return child;
            });
        if (this.autoCreatedDataList && !dataListFound && children instanceof Array) children.push(this.prepareDataList(dataList));
        if (!root) setTimeout(() => (this.repatch({})), 10);
        const minWidth = params.width && Math.max(params.width, 500);
        if (params.forDataLookup)
            return <section className={Utils.classNames(`developer-features list-view-data-lookup `)}
                data-parent-id={params.parentRefId}
                style={{
                    minHeight: (params.height ? params.height + 'px' : 'auto'),
                    maxHeight: (params.height ? params.height + 'px' : 'auto'),
                    minWidth: (minWidth ? minWidth + 'px' : 'auto'),
                    overflow: 'hidden'
                }} ref="root"  >
                {!params.noTitle && <div className="animated fadeInUp title " style={{ fontSize: '1.71rem' }}>

                    {i18n(options.pluralName)}</div>}
                {(params.filterMode != 'none') && <div className="   data-lookup__filter-panel" style={{ display: this.state.quickFilter ? 'none' : 'block' }}>
                    {filterPanel}
                </div>}
                {(params.filterMode != 'none') && <div className="   data-lookup__quick-filter" style={{ display: !this.state.quickFilter ? 'none' : 'flex' }}>
                    {this.renderQuickFilter()}
                </div>}
                <div className="data-items">
                    {children}
                </div>
            </section>;
        return <section className="list-view developer-features" ref="root"   >
            {!!this.error && <SnackBar style={{ width: '100%', maxWidth: '100%', minWidth: '100%' }} variant="error">{(!!this.error && this.error.message)} </SnackBar>}

            <header className="  static-height list-view-header"  >
                {filterPanel}
                <CriticalContent permissionKey="create-permission">
                    <AdvButton color="primary" variant="raised" onClick={() => Utils.navigate(options.routeForSingleView.replace(':id', 'new'))} className="insert-btn" >
                        <i className="fa fa-plus flag" key="flag" />
                        <div className="content" key="content">
                            {Utils.showIcon(options.iconCode, "iconCode")}
                            <div key="addText" className="add-text">{Utils.i18nFormat('new-entity-fmt', options.singularName)}</div>


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
                        <div dangerouslySetInnerHTML={{ __html: printerIcon }} style={{ width: '4.3rem', margin: '0.5rem 1rem' }} />
                        {i18n('export')}
                    </Button>

                </div>
            </header>

            <Paper className="  main-content column  "   >

                <header className="navigator">

                    <Button onClick={this.handleRemove}   >
                        <DeleteIcon />
                        {i18n('delete-items')}

                    </Button>

                </header>
                <div className="data-items">
                    {!!this.refs.root && children}
                </div>
            </Paper>

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
    static fromArray<T>(items: T[], { keyField = 'Id', fields = ['Name'], title, iconCode } = { keyField: 'Id', fields: ['Name'], title: '', iconCode: '' }): StatelessListView {
        const actions: IActionsForCRUD<T> = {
            create: () => Promise.resolve(true),
            update: () => Promise.resolve(true),
            deleteList: () => Promise.resolve(true),
            readList: () => Promise.resolve(items.filter(item => !!item[keyField])) as any,
            read: id => Promise.resolve(items.filter(item => (item[keyField]) == id)[0]),
            getText: dto => dto[fields[0]],
            getId: dto => dto[keyField]
        };
        const options: Partial<IOptionsForCRUD> = {
            singularName: 'local' + (+new Date()) + 'data'
        }
        return p => (<ListViewBox actions={actions} options={options as any} params={Object.assign({}, p, { filterMode: 'none' })}>
            {!!title && <div className="animated fadeInUp  title is-6">
                {Utils.showIcon(iconCode)}
                {i18n(title)}</div>}
            <DataList>
                {fields.map(fieldName => (<Field accessor={fieldName} />))}
            </DataList>
        </ListViewBox>);

    }
}
Object.assign(reinvent.templates, { listView: ListViewBox });
Object.assign(reinvent.utils, { listViewFromArray: ListViewBox.fromArray })