/// <reference path="../../dts/globals.d.ts" />

import { CriticalContent } from '../core/base-component';
import { icon, i18n } from '../core/shared-vars';
import { Utils, changeCase } from '../core/utils';
import { FilterPanel } from '../data/filter-panel';
import { DataList } from '../data/data-list';
import { ISelection, Selection, IDetailsListProps } from 'office-ui-fabric-react/lib/DetailsList'
import { AdvButton } from '../controls/adv-button';
import { SelfBind } from '../core/decorators';
import * as XLSX from 'xlsx';
import OrganicBox from './organic-box';
import { Field } from '../data/field';
import * as fullScreen from '../../../icons/full-screen.svg';
import * as fullScreenExit from '../../../icons/full-screen-exit.svg';
import { AppUtils } from '../core/app-utils';
import { IOptionsForCRUD, IActionsForCRUD, IListViewParams, IDeveloperFeatures, IFieldProps, StatelessListView } from '@organic-ui';
import { createClientForREST } from '../core/rest-api';
import { PrintIcon, DeleteIcon, EditIcon, SearchIcon, AddIcon, FullScreen, FullScreenExit } from '../controls/icons';
import { SelectionMode } from 'office-ui-fabric-react/lib/DetailsList';
import { Button, Paper, TextField, Alert } from '../controls/inspired-components';
import { SnackBar } from '../controls/snack-bar';
import { DeveloperBar } from '../core/developer-features';
import { reinvent } from '../reinvent/reinvent';
import * as printerIcon from '../../../icons/printer.svg';

import { BindingPoint } from '../reinvent/binding-source';
import { checkPermission } from '../core/permission-management';
import swal from 'sweetalert2';
import { Modal } from '../controls/modal';
import { ScrollablePanel } from '../controls/scrollable-panel';
export interface TemplateForCRUDProps extends React.Props<any> {
    id: string;
    mode: 'single' | 'list';
}

interface IState<T> {
    dataFormForFilterPanel: any;
    currentRow: T;
    readingList: boolean;
    deleteDialogContent?: React.ReactNode;
    quickFilter: boolean;
    fullScreen?: boolean;
    searchingValue: string;
    restoreState: boolean;
    error: any;
};

export class ListViewBox<T = any> extends
    OrganicBox<IActionsForCRUD<T>, IOptionsForCRUD, IListViewParams, IState<T>>
    implements IDeveloperFeatures {
    devElement: any;
    devPortId: any;

    columns: IFieldProps[];
    error: any;
    @SelfBind()
    reload(pageNo?) {
        if (typeof pageNo != 'number') pageNo = 0;
        this.refs.dataList && this.refs.dataList.reload(pageNo);
        !this.refs.dataList && setTimeout(() => this.refs.dataList.reload(pageNo), 500);
    }
    storeState(initialData) {
        if (!this.props.params.forDataLookup) {
            const obj = Object.assign({}, this.state.dataFormForFilterPanel, initialData);
            const scrollablePanels = this.querySelectorAll<ScrollablePanel>('.data-list .scrollable-panel')
            const sp = scrollablePanels && scrollablePanels[0];
            obj['_y'] = Math.round(sp && sp.scrollY || 0);
            localStorage.setItem(
                location.pathname + '|dataFormForFilterPanel', JSON.stringify(obj));

        }
    }
    async waitForDataList() {
        const that = this;
        return new Promise(resolve => {
            function tick() {

                if (that.refs.dataList) resolve();
                else setTimeout(tick, 200);

            }
            tick();
        }
        );
    }
    async restoreState() {
        await this.waitForDataList();
        if (!this.props.params.forDataLookup) {
            const raw = localStorage.getItem(location.pathname + '|dataFormForFilterPanel');
            if (raw) {
                Object.assign(this.state.dataFormForFilterPanel, JSON.parse(raw));
                const filterPanel = this.querySelectorAll<FilterPanel>('.filter-panel')[0];
                filterPanel.forceUpdate();
            }
            let { _pageNo: currentPageIndex, _y } = this.state.dataFormForFilterPanel;
            currentPageIndex = currentPageIndex || 0;


            setTimeout(async () => {
                await this.reload(currentPageIndex);
                const scrollablePanels = this.querySelectorAll<ScrollablePanel>('.data-list .scrollable-panel')
                const scrollablePane = scrollablePanels && scrollablePanels[0];
                if (!scrollablePane) return;
                await Utils.delay(500);
                scrollablePane.setScrollY(_y);
            }, 100);
        }


    }
    getFilterPanel() {
        if (this.props && this.props.options && this.props.options.avoidAutoFilter) return undefined;
        const { filterOptions } = this.props.options || {} as any;
        const filterPanel = this.props.children && (React.Children.map(this.props.children, (child: any) => !!child && (child.type == FilterPanel) && child).filter(x => !!x)[0])

        if (filterPanel)
            return React.cloneElement(filterPanel,
                { customActions: this.props.params.customActions, liveMode: filterOptions && filterOptions.liveMode, onApplyClick: this.reload, dataForm: this.state.dataFormForFilterPanel });
        this.columns = this.columns || ListViewBox.getColumns(this.getDataList());
        return <FilterPanel liveMode={filterOptions && filterOptions.liveMode}

            customActions={this.props.params.customActions}
            onApplyClick={this.reload} dataForm={this.state.dataFormForFilterPanel}>
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
        this.state.dataFormForFilterPanel = this.state.dataFormForFilterPanel || {};
        this.state.quickFilter = (this.props.params.filterMode != 'advanced');

    }
    autoCreatedDataList: any;
    static isTargetedDataList(dataList) {
        return dataList && dataList.type && dataList.type.isDataList && (!dataList.props.loader);
    }
    getDataList() {
        const dataList = React.Children.toArray(this.props.children || []).filter(ListViewBox.isTargetedDataList)[0] as React.ReactElement<DataList>;
        if (!dataList)
            return this.autoCreatedDataList = this.autoCreatedDataList || React.createElement(DataList as any, {}, ...React.Children.toArray(this.props.children))

        return dataList;
    }
    static getColumns(dataList: DataList): IFieldProps[] {
        return ListViewBox.getFields(dataList).map(c => c.props)
    }
    static getFields(dataList: DataList): Field[] {
        const { children } = dataList.props as OrganicUi.IDataListProps;
        return React.Children.map(children || [], (child: any) => child && child.type == Field && child).filter(x => !!x)
    }
    getUrlForSingleView(id) {
        const { getUrlForSingleView } = this.props.options;
        if (getUrlForSingleView instanceof Function)
            return getUrlForSingleView(id, this.props.params);
        return this.props.options.routeForSingleView.replace(':id', id);
    }
    getDevButton() {
        return Utils.renderDevButton('ListView', this)
    }
    getSelectedId() {
        const { getSelectedKey } = this.selection as any;
        if (!getSelectedKey) {
            const indices = this.selection.getSelectedIndices();
            const index = indices[0];
            const row = (this.selection.getItems()[index]);
            return this.getId(row);
        }
        else
            return getSelectedKey.apply(this.selection);
    }
    @SelfBind()
    handleEdit() {
        const _id = this.getSelectedId();
        if (!_id) return;
        const url = this.getUrlForSingleView(_id);
        const _pageNo = this.refs.dataList.state.currentPageIndex;
        this.storeState({ _id, _pageNo });
        return Utils.navigate(url);
    }
    @SelfBind()
    selectedItems() {
        const indices = this.selection.getSelectedIndices();
        if (!indices || indices.length == 0) {
            return [];
        }
        const allItems = this.selection.getItems() as T[];
        return indices.map(index => allItems[index]).filter(x => !!x) as T[];
    }
    @SelfBind()
    async handleRemove(forced: boolean) {

        const indices = this.selection.getSelectedIndices();
        if (!indices || indices.length == 0) {
            Alert({ type: 'error', text: i18n.get('not-record-selected') });
            return;
        }
        const allItems = this.selection.getItems() as T[];
        const items = indices.map(index => allItems[index]).filter(x => !!x) as T[];
        const { actions } = this.props;
        const deleteDialogContent = (<div>
            {actions.getText instanceof Function && <ul style={{ listStyle: 'disc' }}>
                {items.map(item => <li>{actions.getText(item)}</li>)}
            </ul>}
        </div>);
        if (!forced) {
            await this.repatch({ deleteDialogContent: null });
            await this.repatch({ deleteDialogContent });
            return;
        }
        const ids = items.map(dto => this.getId(dto));
        try {
            const result = await actions.deleteList(ids);
            await this.refs.dataList.reload();
            return !!result;
        } catch (reason) {
            const lines = reason.toString().split('\n');
            const liHTML = lines.map(li => `<li>${li} </li>`).join('\n');
            swal({ html: `<ul dir="rtl" style="list-style:disc;padding:0 20px;text-align:right" >${liHTML}</ul>`, type: 'error', confirmButtonText: i18n.get('okey') });
            return Promise.resolve(true);
        }
    }
    getId(row) {
        if (!row) return row;
        if (this.actions.getId instanceof Function)
            return this.actions.getId(row);
        return Utils.defaultGetId(row);
    }
    denyHandleSelectionChanged: boolean;
    @SelfBind()
    handleSelectionChanged() {
        if (this.denyHandleSelectionChanged) return;
        const { onSelectionChanged } = this.props.params;
        const indices = this.selection.getSelectedIndices();
        onSelectionChanged instanceof Function && onSelectionChanged(indices, this.selection);
        /* 
        const now = +Date();
        onSelectionChanged instanceof Function &&
              setTimeout(() => {
                   this.denyHandleSelectionChanged = true;
                  try {
                      if (!this.props.params.multipleDataLookup)
                          this.selection.selectToIndex(indices[0])
                      else if (indices.length)
                          indices.forEach(idx => this.selection.setIndexSelected(idx, true, true))
                  } finally {
                      this.denyHandleSelectionChanged = false;
                  }
     
                  //this.adjustSelectedRows();
     
              }, 400);*/
        //this.repatch({});
    }
    static fetchFail: Function;
    static fetchFailSuppressDate: number;
    @SelfBind()
    readList(params) {
        this.state.readingList = true;
        const { mode } = this.props.params as any;
        const { readListByMode } = this.props.actions;
        const readList = this.props.params.customReadList ||
            (mode && readListByMode && readListByMode[mode])
            || this.actions.readList;
        let args = this.props.params.customReadListArguments;
        if (args instanceof Function) args = args();
        if (args !== undefined && !(args instanceof Array)) args = [args];
        return readList(...(args || [params])).then(r => {
            setTimeout(() => {
                this.adjustSelectedRows();
                this.state.readingList = false;
            }, 200);
            return r;
        }, async error => {
            const alertResult = await Alert({ text: i18n.get(error), type: 'error', confirmButtonText: i18n.get('okey') });
            const repatchResult = await this.repatch({ error });
            console.log({ error, alertResult, repatchResult });
            this.devElement = this.makeDevElementForDiag(error);
            return Promise.resolve({ rows: [], totalRows: 0 });
        });


    }
    @SelfBind()
    readListFake(params) {

        return Promise.resolve({ rows: [], totalRows: 0 });

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
    async adjustSelectedRows() {

        const { params } = this.props;

        let { selectedId } = params;
        selectedId = selectedId || this.state.dataFormForFilterPanel._id;

        if (selectedId || params.defaultSelectedValues) {

            const defaultSelectedValues = (params.defaultSelectedValues instanceof Function ?
                params.defaultSelectedValues() : (params.defaultSelectedValues ||
                    { [selectedId]: true }
                ));
            const items = this.selection.getItems();
            const selectedIds = items.map((item, index) => ({ index, id: this.getId(item) }))
                .filter(({ id }) => !!defaultSelectedValues[id]);
            setTimeout(() => {
                selectedIds.forEach(({ index }) => {
                    this.denyHandleSelectionChanged = true;
                    this.selection && this.selection.setIndexSelected(index, true, false);
                    this.denyHandleSelectionChanged = false;
                });
            }, 100);


        }

    }
    componentDidMount() {
        super.componentDidMount();
        !this.props.params.forDataLookup && this.setPageTitle(i18n.get(this.props.options.pluralName));

        if (this.state.restoreState) {
            this.state.restoreState = false;
            setTimeout(() => {
                this.restoreState();

            }, 10);
        }
        if (!this.props.params.forDataLookup) {
            for (const filterPanel of this.querySelectorAll<FilterPanel>('.filter-panel')) {
        //        console.log('filterPanel>>',filterPanel,filterPanel.queryStringApplied);
           //     if (filterPanel.queryStringApplied) return;
                filterPanel.queryStringApplied = true;
                debugger;
                if (filterPanel.assignValuesFromQueryString(location.search))
                    this.reload();
            }
        }
    }
    @SelfBind()
    handleLoadRequestParams(params: OrganicUi.IAdvancedQueryFilters) {
        const filterPanel = this.querySelectorAll<FilterPanel>('.filter-panel')[0];
        if (filterPanel) {
            const filterModel = filterPanel.getFilterItems()
            params.filterModel = filterModel instanceof Array ? filterModel.filter(filterItem => !Utils.isUndefined(filterItem.value)) : filterModel;

            if (filterModel instanceof Array && this.props.params.dataLookupProps && this.props.params.dataLookupProps.filterModelAppend instanceof Array && params.filterModel instanceof Array)
                params.filterModel.push(...this.props.params.dataLookupProps.filterModelAppend)
        }
        return params;
    }
    @SelfBind()
    handleSearchQuery(e: React.ChangeEvent<HTMLInputElement>) {
        const { currentTarget } = e;
        if (currentTarget) {
            const { value } = currentTarget;
            setTimeout(() => (value == currentTarget.value) && this.repatch({ searchingValue: value }), 400);
        }
    }
    renderQuickFilter() {
        return <>
            < i className="fa fa-search" ></i >
            <TextField fullWidth onChange={this.handleSearchQuery} />
        </>
    }

    prepareDataList(intialDataList: React.ReactElement<OrganicUi.IDataListProps>) {
        const multiple = this.getMultiple();
        const { params } = this.props;
        const dataItemsElement = this.refs.root.querySelector('.data-items');
        if (!this.selection) {
            const SelectionClass: typeof Selection = (intialDataList.type as typeof DataList).getSelectionClass() as any;
            this.selection = new SelectionClass({
                selectionMode: this.getMultiple() ? SelectionMode.multiple : SelectionMode.single,
                onSelectionChanged: this.handleSelectionChanged,
                canSelectItem: params.canSelectItem
            } as Partial<ISelection>);
        }
        return React.cloneElement(intialDataList, Object.assign(
            {}, intialDataList.props, {
                ref: "dataList",
                ignoreScroll: this.props.params.dataLookupProps &&
                    this.props.params.dataLookupProps.popupMode &&
                    this.props.params.dataLookupProps.popupMode.inlineMode,
                height: dataItemsElement ? dataItemsElement.clientHeight : params.height,
                onDoubleClick: params.forDataLookup ? null : this.handleEdit,
                onLoadRequestParams: this.handleLoadRequestParams,
                multiple: this.props.params.forDataLookup && this.props.params.multipleDataLookup,
                itemIsDisabled: params.canSelectItem && (item => !params.canSelectItem(item)),
                loader: Utils.fakeLoad() ? this.readListFake : this.readList,
                onPageChanged: this.props.params.onPageChanged,
                flexMode: true,

                selection: this.selection,

            } as Partial<OrganicUi.IDataListProps>,
            multiple
                ? {
                    selectionMode: 2, checkboxVisibility: 1
                } as Partial<IDetailsListProps>
                : {} as Partial<IDetailsListProps>));
    }
    @SelfBind()
    handleToggleFullScreen() {
        this.repatch({ fullScreen: !this.state.fullScreen });
    }
    handleNewButton() {
        const url = this.getUrlForSingleView('new');
        const _pageNo = this.refs.dataList.state.currentPageIndex;
        this.storeState({ _pageNo });
        Utils.navigate(url);

    }
    renderContent() {
        this.defaultState({ restoreState: !!this.props.params['restoreState'] });
        const dataList = this.getDataList();
        if (!dataList) return this.renderErrorMode(`${this.props.options.pluralName} listView is invalid`, 'add data-list as children');
        const { options, params } = this.props;
        const s = this.state as any;
        s.toggleButtons = s.toggleButtons || {};
        const { root } = this.refs;
        const filterPanel = this.getFilterPanel();
        let dataListFound = false;
        const children = !!root &&
            React.Children.toArray(this.props.children).map((child: any) => {
                if (child && (child.type == FilterPanel)) return null;
                if (child && child.props && (child.props.role || child.props['data-role'])) return null;
                if (child && (child.type && child.type.isField)) return null;
                if (ListViewBox.isTargetedDataList(child)) {
                    dataListFound = true;
                    return this.prepareDataList(dataList);
                }
                return child;
            });
        if (this.autoCreatedDataList && !dataListFound && children instanceof Array) children.push(this.prepareDataList(dataList));
        if (!root && !Utils.fakeLoad()) setTimeout(() => (this.repatch({})), 10);
        let { permissionKeys } = options || {} as any;
        permissionKeys = permissionKeys || {} as any;
        const minWidth = params.width && Math.max(params.width, 500);
        if (params.forDataLookup)
            return <section className={Utils.classNames(`developer-features list-view-data-lookup `, options && options.classNameForListView)}
                data-parent-id={params.parentRefId}
                style={{
                    width: !this.props.params['noWidth'] && params.width || ('auto'),
                    maxWidth: '100%',
                    overflow: 'hidden'
                }} ref="root"  >

                {(params.filterMode != 'none') && <div className="   data-lookup__filter-panel" style={{ display: this.state.quickFilter ? 'none' : 'block' }}>
                    {filterPanel}
                </div>}
                {/*(params.filterMode != 'none') && <div className="   data-lookup__quick-filter" style={{ display: !this.state.quickFilter ? 'none' : 'flex' }}>
                    {this.renderQuickFilter()}
            </div>*/}
                <div className="data-items">
                    {children}
                </div>
            </section>;
        const { deleteDialogContent } = this.state;
        return <section className={Utils.classNames("list-view developer-features", options.classNameForListView)} ref="root"   >
            {!!this.error && <SnackBar style={{ width: '100%', maxWidth: '100%', minWidth: '100%' }} variant="error">{(!!this.error && this.error.message)} </SnackBar>}

            {!s.fullScreen && <>
                <header className="  static-height list-view-header"  >
                    {filterPanel}
                    <CriticalContent permissionValue={permissionKeys && permissionKeys.forCreate} permissionKey="create-permission">
                        <AdvButton color="primary"
                            disabled={options.permissionKeys && !checkPermission(options.permissionKeys.forCreate)}
                            variant="raised" onClick={this.handleNewButton.bind(this)} className="insert-btn" >
                            <i className="fa fa-plus flag" key="flag" />
                            <div className="content" key="content">
                                {Utils.showIcon(options.iconCode, "iconCode")}
                                <div key="addText" className="add-text">{Utils.i18nFormat('new-entity-fmt', options.singularName)}</div>
                            </div>
                        </AdvButton>
                    </CriticalContent>
                    <CriticalContent permissionValue={permissionKeys && permissionKeys.forRead} permissionKey="view-permission" />
                    <CriticalContent permissionValue={permissionKeys && permissionKeys.forUpdate} permissionKey="edit-permission" />
                    <CriticalContent permissionValue={permissionKeys && permissionKeys.forDelete} permissionKey="delete-permission" />


                </header>
                <div style={{ margin: "10px 0 10px 0" }} /></>}
            <Paper className="main-content column  "   >

                <header className="navigator" style={{ marginBottom: '0.5rem' }}>
                    {this.renderNavigator()}
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
            {!!deleteDialogContent && <Modal type="warning" buttons={{ yes: this.handleRemove.bind(this, true), no: () => true }} >
                {i18n('are-you-sure-delete')}
                {deleteDialogContent}
            </Modal>}
        </section >;
    }
    renderNavigator() {
        const { options } = this.props;
        const { fullScreen: isFullScreen } = this.state;
        return <>
            {(!options.permissionKeys || checkPermission(options.permissionKeys.forDelete)) && <Button onClick={this.handleRemove.bind(this, false)}   >
                <DeleteIcon />
                {i18n('delete-items')}
            </Button>}
            {this.childrenByRole['nav']}
            <div style={{ flex: '1' }}></div>
            <Button onClick={this.handleToggleFullScreen} className="testable__fullScreen">
                {Utils.showIcon({ svg: isFullScreen ? fullScreenExit : fullScreen, width: '3rem', margin: '0 0.7rem' })}

                {i18n(!isFullScreen ? 'full-screen' : 'full-screen-exit')}
            </Button>
            <AdvButton onClick={this.handleExcelExport}>
                <div dangerouslySetInnerHTML={{ __html: printerIcon }} style={{ width: '3rem', margin: '0 0.7rem' }} />
                {i18n('export')}
            </AdvButton>

        </>
    }
    async handlePrint() {

    }
    @SelfBind()
    async handleExcelExport() {
        const suffixForDownload = location.pathname.split('/').slice(-1).join('');

        const inputValue: string = (localStorage.getItem('excel-limit') || 100) as string;
        const inputOptions = Object.assign({}, ...[50, 100, 500, 1000, 10000, 100000].map(n => ({ [n]: Utils.numberFormat(n) })));
        const handleExport = exportedFormat => {
            async function doIt() {
                Object.assign(window, { exportedFormat });
                Utils.simulateClick(document.querySelector('.swal2-confirm'));
            }
            doIt();
        }
        Object.assign(window, { handleExport });
        window['exportedFormat'] = '';
        const { value: rowCount } = await swal({
            title: 'تعداد رکورد های خروجی',
            input: 'select',
            inputValue,
            heightAuto: false,
            showConfirmButton: false,
            showCloseButton: true,
            inputOptions,
            footer: `<a style="padding: 5px;color: black;background: #ff0000;" href="javascript:handleExport('pdf')">
                        <img style="float: left;width:4em" src="data:image/png;base64,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" />
                        <label style="margin: 1em;float:right;">PDF</label>
                    </a>&ensp;&ensp;
                    <a style="padding: 5px;color: black;background: #7cbb00;" href="javascript:handleExport('excel')">
                        <img style="float: left;width:4em" src="data:image/png;base64,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" />
                        <label style="margin: 1em;float:right;">Excel</label>
                    </a>`
        });
        const desiredExportFormat = window['exportedFormat'];

        if (!rowCount) return;
        this.props.actions.export(desiredExportFormat, this.handleLoadRequestParams({} as any));
        return;

        const dataList: DataList = this.querySelectorAll('.data-list-wrapper')[0] || this.refs.dataList;
        const { rows } = await dataList.loadDataIfNeeded(0, { avoidShowData: true, rowCount, loadingPageIndex: -1, currentPageIndex: -1 })
        const fields = ListViewBox.getFields(dataList);
        const columns = ListViewBox.getColumns(dataList);
        const textReaders = fields.map(fld => Field.prototype.getTextReader.apply(fld));
        console.log({ rows, dataList, fields, textReaders });

        const fieldNames = columns.map(c => Field.getAccessorName(c.accessor));
        const fieldCaptions = columns.map(col => Field.getLabelText(col.accessor, col.label));
        const cells = [fieldCaptions]
            .concat(rows.map(row => fieldNames.map((fieldName: any, idx) => Utils.extractText(row[fieldName], textReaders[idx]))));

        const worksheet = XLSX.utils.aoa_to_sheet(cells);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, suffixForDownload);

        // Adjust Right To Left
        if (!workbook.Workbook) workbook.Workbook = {};
        if (!workbook.Workbook.Views) workbook.Workbook.Views = [];
        if (!workbook.Workbook.Views[0]) workbook.Workbook.Views[0] = {};
        workbook.Workbook.Views[0].RTL = true;
        const cellWidths = DataList.bestFitColumn(fieldNames.length * 250, fieldNames.map((key, idx) => ({ key, name: fieldCaptions[idx] })), rows).map(wpx => ({ wpx }));
        workbook.Sheets[suffixForDownload]['!cols'] = cellWidths;
        XLSX.writeFile(workbook, `excel-result-${suffixForDownload}.xlsx`);
        localStorage.setItem('excel-limit', rowCount);
    }
    static fromEnum(enumType, extraParams): StatelessListView {
        return ListViewBox.fromArray(Utils.enumToIdNames(enumType), extraParams);
    }
    static fromArray<T>(items: T[], { keyField = 'Id', fields = ['Name'], title, iconCode, iconCodes } = { keyField: 'Id', fields: ['Name'], title: '', iconCode: '', iconCodes: null }): StatelessListView {
        const renderCellForIcon = (data) => (<div>{iconCodes && iconCodes[data[keyField]] && <span className="icon-code"> {Utils.showIcon(iconCodes[data[keyField]])}   </span>} {i18n(data[fields[0]])}</div>);

        const actions: IActionsForCRUD<T> = {
            create: () => Promise.resolve(true),
            update: () => Promise.resolve(true),
            deleteList: () => Promise.resolve(true),
            readList: () => Promise.resolve(items.filter(item => !!item[keyField])) as any,
            read: id => Promise.resolve(items.filter(item => (item[keyField]) == id)[0]),
            getText: iconCodes ? renderCellForIcon : dto => dto[fields[0]],
            getId: dto => dto[keyField],
            readByIds: () => Promise.resolve(items.filter(item => !!item[keyField])) as any,
            export: null
        };
        const options: Partial<IOptionsForCRUD> = {
            singularName: 'local' + (+new Date()) + 'data',
            classNameForListView: 'enum-mode'
        }
        return p => (<ListViewBox actions={actions} options={options as any} params={Object.assign({}, p, { filterMode: 'none' } as Partial<IListViewParams>)}>
            {!!title && <div className="animated fadeInUp  title is-6">
                {Utils.showIcon(iconCode)}
                {i18n(title)}</div>}

            <DataList>
                {fields.map((fieldName, idx) => (<Field accessor={new BindingPoint(fieldName, [], false)} onRenderCell={iconCodes && (idx == 0) && renderCellForIcon
                } />))}
            </DataList>
        </ListViewBox>);

    }

}
Object.assign(reinvent.templates, { listView: ListViewBox });
Object.assign(reinvent.utils, { listViewFromArray: ListViewBox.fromArray, listViewFromEnum: ListViewBox.fromEnum });
