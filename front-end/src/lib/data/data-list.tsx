/// <reference path="../../dts/globals.d.ts" />   
import { BaseComponent } from '../core/base-component';
import { icon, i18n } from '../core/shared-vars';
import { openRegistry } from '../core/registry';
import { Spinner } from '../core/spinner';
import { Utils, changeCase } from '../core/utils';

import { Field } from '../data/field';
import { IListData, IDeveloperFeatures, IFieldProps } from '@organic-ui';
import { ScrollablePanel } from '../controls/scrollable-panel';
import { AdvButton } from "../controls/adv-button";
import { DetailsList, FocusZone, Button, Menu, MenuItem } from '../controls/inspired-components';
import { IColumn, ConstrainMode, IDetailsListProps, Selection, IDetailsRowProps } from 'office-ui-fabric-react/lib/DetailsList';
import { SelfBind } from '../core/decorators';
import swal from 'sweetalert2';

interface IPaginationProps {
    currentPageIndex: number;
    loadingPageIndex?: number;
    totalPages: number;
    totalRows?: number;
    onPageIndexChange: (index: number) => void;
    anchorEl?: HTMLElement;
    disabled?: boolean;
}
const defaultNormalPageCount = 2;
const defaultMaxPageCount = 10;
class Pagination extends BaseComponent<IPaginationProps, IPaginationProps>{
    showButton(targetPageIndex, n, className?) {
        const p = this.props
        return (<li key={n} className="">
            <Button variant="flat"
                className={Utils.classNames(className, n === p.loadingPageIndex ? "button  " : "", "pagination-link",
                    targetPageIndex == n && 'is-current')}
                onClick={e => {
                    if (p.loadingPageIndex > 0) return;
                    if (p.disabled) return;
                    e.preventDefault();
                    p.onPageIndexChange instanceof Function && p.onPageIndexChange(n);
                }}   >{n + 1}</Button>
        </li>);
    }
    @SelfBind()
    handleInputValidator(value: string) {
        const v = parseInt(value);
        if (!(v > 0)) return i18n.get('invalid');
        if (v < 1) return i18n.get('min-limit');
        if (v > this.props.totalPages) return i18n.get('max-limit');
        return ''
    }
    @SelfBind()
    async handleJump(e: React.MouseEvent<HTMLElement>) {
        if (this.props.totalPages <= defaultMaxPageCount) {
            return this.repatch({ anchorEl: e.currentTarget })
        } else {
            document.body.style.setProperty('height', '100%', 'important');
            const alertResult = await swal({
                showCancelButton: true, input: 'number',
                inputValidator: this.handleInputValidator, title: i18n.get('jump-page'), inputPlaceholder: i18n.get('page-no'),
                confirmButtonText: i18n.get('apply'),
                cancelButtonText: i18n.get('cancel')
            });
            setTimeout(() => document.body.style.removeProperty('height'), 500);
            if (alertResult && parseInt(alertResult.value) > 0)
                this.props.onPageIndexChange(parseInt(alertResult.value) - 1);
        }
    }
    renderContent() {
        const p = this.props, s = this.state;

        const targetPageIndex = p.loadingPageIndex < 0 ? (p.currentPageIndex || 0) : p.loadingPageIndex;
        const currentPageIndex = p.currentPageIndex || 0;
        const pageNumbers = Array.from({ length: p.totalPages })
            .map((_, idx) => idx)
            .slice(Math.max(0, currentPageIndex - defaultNormalPageCount), currentPageIndex + defaultNormalPageCount)
            .filter(n => n > 0 && n < p.totalPages - 1);
        const ellipsis = (<li className=""><span className="pagination-ellipsis">&hellip;</span></li>);
        return <nav key="pagination" className="pagination   is-centered" role="navigation" aria-label="pagination" >
            {Boolean(s.anchorEl) && p.totalPages <= defaultMaxPageCount && <Menu
                id="simple-menu"
                anchorEl={s.anchorEl}
                open={true}
                onClose={() => this.repatch({ anchorEl: null })}
            >
                {Array.from({ length: p.totalPages }).map((_, idx) => (<MenuItem onClick={() => (p.onPageIndexChange(idx), this.repatch({ anchorEl: null }))}>{i18n('page')}{' '}{Utils.persianNumber(idx + 1)}</MenuItem>))}

            </Menu>}
            <span className="total-rows" >
                <Button onClick={this.handleJump}>{Utils.showIcon('fa-angle-double-up')}</Button>
                <label>
                    {i18n('total-rows')}
                </label>
                {p.totalRows}
            </span>

            <Button variant="raised" className="pagination-previous" disabled={targetPageIndex <= 0} onClick={() => p.loadingPageIndex < 0 && p.onPageIndexChange(targetPageIndex - 1)}>{Utils.showIcon('fa-chevron-right')}</Button>


            <Button variant="raised" className="pagination-next" disabled={targetPageIndex >= p.totalPages - 1} data-loading-idx={p.loadingPageIndex} onClick={() => p.loadingPageIndex < 0 && p.onPageIndexChange(targetPageIndex + 1)} >{Utils.showIcon('fa-chevron-left')}</Button>

            <ul key="pagination-list" className="pagination-list">
                {this.showButton(targetPageIndex, 0)}
                {!pageNumbers.includes(1) && !!pageNumbers.length && ellipsis}
                {pageNumbers.map(this.showButton.bind(this, targetPageIndex))}
                {!pageNumbers.includes(p.totalPages - 2) && !!pageNumbers.length && (p.totalPages >= defaultNormalPageCount) && ellipsis}

                {this.showButton(targetPageIndex, p.totalPages - 1, 'testable testable__lastPage')}

            </ul>

        </nav >
    };
}
//----------------------------------------------------------------------------------------

export interface IState {
    currentRow: any;
    startFrom?: number;
    listData: IListData;
    currentPageIndex: number;
    scrollTop: number;
    appliedScrollTop: number;
    lastTotalRows: number;
    isLoading: boolean;
    appliedRows: any[];
    sortedField: string;
    sortedFieldDir: boolean;
    loadingPageIndex?: number;
    popupActionForRowIndex?: number;
    ratio?: number;
    noPaging?: boolean;
    searchingValue?: string;
    sortedColumn: IColumn;
    sortedColumnKey: string;
    sortedColumnDesc: boolean;
}
let randomStrings = {};

function defaultEmptyResult(p: OrganicUi.IDataListProps<any>) {
    return <div className="">no-result</div>;
}
const fakeLength = {} as any;
export class DataList extends BaseComponent<OrganicUi.IDataListProps<any>, IState> implements IDeveloperFeatures {
    items: any[];
    rowCount: number;
    static defaultProps = {
        itemHeight: 42,
        paginationMode: 'paged'
    }
    static isDataList = true;
    refs: any;/* {
        root: HTMLElement;
        parent: HTMLElement;
        content: HTMLElement;
        detailList: DetailsList;
    }   */
    static Templates = openRegistry<Function>()
    devPortId: number;
    detailList: JSX.Element;
    bestFitColumnWidths: number[];
    lastModForBestFitColumnWidths: number;
    fields: { [key: string]: React.ReactElement<IFieldProps> };
    getFakeItems(length) {
        return Array.from({ length }, (_, idx) => idx);
    }
    reload(pageIndex?: number) {
        this.detailList = null;
        this.items = null;
        const s = this.state;
        this.items = [];
        if (typeof pageIndex != 'undefined') {
            this.repatch({ currentPageIndex: pageIndex });
        }
        for (const sp of this.querySelectorAll<ScrollablePanel>('.scrollable-panel'))
            sp.setScrollY(0);
        const startFrom = pageIndex === undefined ? +s.startFrom : pageIndex * this.getRowCount();
        return Utils.toPromise(this.loadDataIfNeeded(startFrom, { loadingPageIndex: -1, rowCount: 0, currentPageIndex: pageIndex, avoidShowData: false }));
    }
    constructor(p: OrganicUi.IDataListProps<any>) {
        super(p);
        this.devPortId = Utils.accquireDevPortId();
        this.rowCount = p.rowCount;
        const defaultState: Partial<IState> = { startFrom: 0, ratio: 0 };
        this.state = this.state || defaultState as any;
        Object.assign(this.state, defaultState);

        Object.assign(this.state, { loadingPageIndex: 0 });
        this.handleDoubleClick = this.handleDoubleClick.bind(this);
        this.lastModForBestFitColumnWidths = 0;

    }


    lastDataLoading = new Date();
    accquiredSelection: any;

    async callAction(row, rowIndex, rows, funcName: string) {
        const func = this.props.customActions[funcName];
        if (this.props.onActionExecute) {
            const customResult = this.props.onActionExecute(funcName, row, rows);

            if (React.isValidElement(customResult)) return customResult;
        }
        const updatedRow = Utils.clone(await Utils.toPromise(func(row, rows)));
        if (!updatedRow) return;
        if (updatedRow == 'remove') {
            this.items.splice(rowIndex, 1);
        }
        else {
            for (const key of Object.keys(row)) delete row[key];
            this.items[rowIndex] = Object.assign(row, updatedRow);
        }
        this.reload();
        this.forceUpdate();


    }
    getCustomActions(row, rowIndex) {
        return <div className="custom-actions">
            {Object.keys(this.props.customActions).map(funcKey => (
                <AdvButton noSpinMode={funcKey == 'handleEdit' || funcKey == 'handleRemove'} onClick={this.callAction.bind(this, row, rowIndex, this.items, funcKey)} >
                    {this.props.customActionRenderer(funcKey, this.props.customActions[funcKey])}
                </AdvButton>
            ))}
        </div>
    }
    searchItems(searchingValue) {
        this.repatch({ searchingValue });
    }
    loadDataIfNeeded(startFrom: number, { currentPageIndex, loadingPageIndex, avoidShowData, rowCount } = { loadingPageIndex: -1, currentPageIndex: 0, avoidShowData: false, rowCount: 0 }) {
        const fullHeight = this.getFullHeight();
        const s = this.state, p = this.props;
        if (!p.loader) return null;
        if (!avoidShowData) this.items = null;
        let fetchableRowCount = rowCount || p.rowCount || this.rowCount || 10;
        //if (s.isLoading) return;11
        if (!avoidShowData) {
            Object.assign(this.state, { isLoading: true })
            setTimeout(() => {
                if (this.state.isLoading) {
                    this.detailList = null;

                    this.repatch({});
                }
            }, 1000);
            const { root } = this.refs;
            const surface = root && root.querySelector('.ms-List-surface') as HTMLElement;
            surface && (surface.style.marginTop = null);
            this.lastDataLoading = new Date();

        }
        if (fetchableRowCount < 0) fetchableRowCount = 0;
        const colId = s.sortedColumnKey;
        const sortedField: React.ReactElement<IFieldProps> = (colId && this.fields && this.fields[colId]) || {} as any;
        const params = {
            startFrom, rowCount: fetchableRowCount
            , sortModel: s.sortedColumnKey ? [{ colId, sort: s.sortedColumnDesc ? 'desc' : 'asc', ...(sortedField && sortedField.props && sortedField.props.sortData) }] : {}
        };
        const paramsForLoaders = this.props.onLoadRequestParams instanceof Function ? this.props.onLoadRequestParams(params) : params;

        const promise: PromiseLike<any> = paramsForLoaders ? Utils.toPromise(this.props.loader(paramsForLoaders)) : Promise.resolve({
            totalRows:0,rows:[]
        });

        return promise instanceof Promise && promise.then(listData => {
            if (avoidShowData) return listData;
            if (listData instanceof Array) {
                this.repatch({ noPaging: true });
                listData = { rows: listData, totalRows: listData.length };
            }
            else{
                if(this.state.noPaging)
                this.repatch({ noPaging: false });
                
            }


            //this.rowCount = Math.max(listData.rows.length, Number.isNaN(this.rowCount) ? 0 : (this.rowCount || 0));
            this.detailList = null;

            this.repatch({ loadingPageIndex, listData, isLoading: false, currentPageIndex });
            setTimeout(() => {

                const scrollBarY = this.refs.root && this.refs.root.querySelector('.scrollBarY ')
                if (scrollBarY && parseInt(scrollBarY.getAttribute('data-minheight')) != this.getFullHeight()) {
                    //this.lastDataLoading = new Date();
                    this.repatch({});
                }
            }, 100);
            const { onPageChanged } = this.props;
            if (onPageChanged instanceof Function) {
                onPageChanged(listData);
            }
            this.lastDidUpdateTime = null;
            this.handleDidUpdate(null);
            return listData;
        }, (error) => (this.repatch({ isLoading: false }), Promise.reject(error)));
    }
    scrollTimer: any;

    getDevButton() {
        return Utils.renderDevButton('DataList', this);
    }


    handleDoubleClick(e: React.MouseEvent<any>) {
        this.props.onDoubleClick && this.props.onDoubleClick();
    }
    scrollToIndex(index) {
        const { detailList } = this.refs;
        detailList &&
            detailList.scrollToIndex instanceof Function &&
            detailList.scrollToIndex(index);
        const { root, parent } = this.refs;
        const detailsRow = root.querySelector('.ms-DetailsRow');

        if (detailsRow)
            parent.scrollTop = (detailsRow.clientHeight * index);
    }
    renderContent() {
        const p = this.props, s: IState = this.state;
        if (!this.accquiredSelection && p.accquireSelection instanceof Function) {
            const prototype = DataList;
            const selectionClass = prototype.getSelectionClass()
            this.accquiredSelection = new selectionClass();
            p.accquireSelection(this.accquiredSelection);
        }
        const { startFrom } = s;
        s.listData = s.listData || (!p.startWithEmptyList && this.loadDataIfNeeded(+startFrom)) as any;
        const length = this.rowCount || 10;
        let items = this.items =
            s.listData && s.listData.rows;

        if (s.isLoading) items = this.getFakeItems(length);
        items = items instanceof Array ? items.filter(notFalse => !!notFalse) : [];
        if (!this.refs.root) {
            this.repatch({}, null, 100);
        }
        return (
            <div ref="root" onDoubleClick={this.handleDoubleClick}
                data-height={p.height} style={p.flexMode ? {} : { minHeight: p.height, maxHeight: p.height }}
                className={Utils.classNames("data-list-wrapper developer-features", p.className)} data-flex-mode={p.flexMode}>
                {p.customDataRenderer instanceof Function ? p.customDataRenderer(items, this) : this.renderItems(items)}

            </div>
        );
    }
    private renderRow(props: IDetailsRowProps, defaultRender: any) {
        const { itemIsDisabled, onGetClassNamePerRow } = this.props;
        const rowIsDisabled = itemIsDisabled instanceof Function && itemIsDisabled(props.item);
        const classNamePerRow = onGetClassNamePerRow instanceof Function && onGetClassNamePerRow(props.item, props);
        props.className = Utils.classNames(rowIsDisabled && "row-disabled", props.className, classNamePerRow);
        return defaultRender(props);
    }
    static toTextLength(value) {
        if (!value) return 0;
        if (value.length) return value.length;
        if (React.isValidElement(value)) return React.Children.toArray((value.props as any).children).map(DataList.toTextLength).reduce((total, len) => len + total, 0);
        return value.toString().length;
    }
    static bestFitColumn<T>(totalWidth: number, columns: Partial<IColumn>[], items: T[]): number[] {
        const charsInKeys = columns
            .map(col => Math.max(DataList.toTextLength(col.name), ...items.map(item => (item[col.key] || 0).toString().length)));
        const totalLengths = charsInKeys.reduce((total, len) => total + len, 0);
        return charsInKeys.map(len =>
            Math.min(len * 15, Math.max(len * 10, Math.round((len * totalWidth) / totalLengths))));
    }
    applyClassToContent(selector: string, opName: string, className: string) {
        const { root } = this.refs;
        if (!root) return;
        const target = root.querySelector(selector);
        const op = target && target.classList && target.classList[opName];
        op instanceof Function && op(className);
    }

    lastDidUpdateTime: number;
    @SelfBind()
    handleDidUpdate(detailList) {
        if (this.state.isLoading) return;
        setTimeout(() => {
            const { root } = this.refs;
            if (!root) return;
            const now = +new Date();
            if (this.lastDidUpdateTime && (now - this.lastDidUpdateTime < 3000)) {
                return;
            }
            const focusZoneArray = Array.from(root.querySelectorAll('.ms-SelectionZone .ms-DetailsRow-fields') || []) as HTMLElement[];
            if (!focusZoneArray || focusZoneArray.length == 0) return;
            const clientWidth = Math.max(0, ...focusZoneArray.map(c => c.clientWidth));

            for (const focusZone of focusZoneArray) {
                let targetNode = focusZone;

                while (targetNode) {
                    targetNode.style.minWidth = clientWidth + 'px';
                    if (targetNode.classList.contains('ms-Viewport')) break;
                    targetNode = targetNode.parentElement;
                }
                this.lastDidUpdateTime = +new Date();
            }
        }, 500);
    }
    handleMouseEnter(e: React.MouseEvent<HTMLElement>) {
        const msList = e.currentTarget as HTMLElement;
        if (msList) {
            msList.classList.add('scrollY');

        }
    }
    handleMouseLeave(e: React.MouseEvent<HTMLElement>) {
        const msList = e.currentTarget.querySelector('.ms-List');
        msList && msList.classList.remove('scrollY');
    }
    handleSyncScroll(e) {
        const { root } = this.refs;
        const surface = root && root.querySelector('.ms-List-surface') as HTMLElement;
        if (!surface) return;
        surface.style.marginTop = `-${e.y}px`;
    }
    @SelfBind()
    getFullWidth() {
        return this.evalFromRef('root', root => root.querySelector('.ms-SelectionZone .ms-DetailsRow-fields').clientWidth);
    }
    @SelfBind()
    getFullHeight() {
        if (this.state.isLoading) return 0;
        if (!this.items || !this.items.length) return 0;
        const fullHeight = this.evalFromRef('root', r => r.querySelector('.ms-Viewport').clientHeight);
        return fullHeight || 1;
    }
    @SelfBind()
    handleHeaderColumnClick(ev?: React.MouseEvent<HTMLElement>, column?: IColumn) {
        if (!ev || !column) return;
        const s = this.state;
        this.detailList = null;
        const field = this.fields[column.key];
        if (field && field.props && field.props.avoidSort) return;
        this.repatch({
            sortedColumn: column,
            sortedColumnKey: column.key,
            sortedColumnDesc: s.sortedColumnKey == column.key ? !s.sortedColumnDesc : false
        });
        this.reload();
    }
    getColumnName(accessor, label): any {
        return <div style={{ display: 'flex', width: '100%' }}>
            {Field.getLabel(accessor, label)}
            <span className="sort-icon" style={{ padding: '0 0.5rem' }}>
                {Utils.showIcon('fa-arrow-down')}
                {Utils.showIcon('fa-arrow-up')}
            </span>
        </div>
    }
    changePage(pageIndex) {
        const rowCount = this.getRowCount();
        pageIndex = pageIndex || 0;
        this.items = [];
        this.repatch({ loadingPageIndex: pageIndex });
        return this.loadDataIfNeeded(pageIndex * rowCount, { loadingPageIndex: -1, rowCount: 0, currentPageIndex: pageIndex, avoidShowData: false });


    }
    getRowCount() {
        return this.rowCount || 10;
    }
    renderItems(items: any[]) {
        const length = this.getRowCount();
        const { root } = this.refs;
        const p = this.props, s = this.state;
        const columnArray: React.ReactElement<IFieldProps>[] = this.props.children instanceof Array ? this.props.children as any : [this.props.children];
        const textReaders = columnArray.filter(col => col && (col.type == Field)).map(fld => Field.prototype.getTextReader.apply(fld))

        const { listData } = this.state;
        const columns: Partial<IColumn>[] =
            columnArray.filter(col => col && (col.type == Field))
                .map((col, idx) => Object.assign({ col }, col.props || {}, {
                    key: Field.getAccessorName(col.props.accessor),
                    name: this.getColumnName(col.props.accessor, col.props.label),
                    maxWidth: (col.props.columnProps && col.props.columnProps.maxWidth) || 300,
                    headerClassName: this.state.sortedColumn && ((Field.getAccessorName(col.props.accessor) == this.state.sortedColumn.key) ?
                        (this.state.sortedColumnDesc ? 'sort-column sort-column-desc' : 'sort-column sort-column-asc')
                        : ''),
                    onRender: (item?: any, index?: number, column?: IColumn) => {
                        if (typeof item == 'number') {
                            const max = typeof column.name == 'string' ? Math.round(column.name.length * 10) : 4;

                            const length = fakeLength[index + column.key] =
                                fakeLength[index + column.key] || Math.ceil(Math.random() * max);

                            return (<span className="fake " >{'.'.repeat(length)}<i /></span>);
                        }
                        const textReader = textReaders[idx];
                        const displayText = textReader instanceof Function ? textReader(item[column.key], item) : item[column.key];
                        return col.props.onRenderCell instanceof Function ? col.props.onRenderCell(item, index, column) : displayText;
                    }
                } as Partial<IColumn>, col.props.columnProps || {}) as IColumn);



        if (p.customActions && p.customActionRenderer) {
            columns.push({ key: columns[0].key, name: ' ', fieldName: columns[0].fieldName, onRender: this.getCustomActions.bind(this), maxWidth: 130, minWidth: 100 })
        }

        this.fields = Object.assign({}, ...columnArray.map(c => ({ [Field.getAccessorName(c.props.accessor)]: c })));
        const totalRows = listData && listData.totalRows || 0;
        const totalPages = Math.ceil(totalRows / (length)) || 0;
        const now = +new Date();
        if (!this.props.noBestFit && !s.isLoading) {
            if ((now - this.lastModForBestFitColumnWidths) > 500 && root && items && items.length) {
                this.bestFitColumnWidths = DataList.bestFitColumn(root.clientWidth, columns, items);
                this.lastModForBestFitColumnWidths = +new Date();
            }
            if (this.bestFitColumnWidths) {
                columns.forEach((col, idx) => Object.assign(col, { minWidth: col.minWidth || this.bestFitColumnWidths[idx] } as IColumn))
            }
        }
        const rowsCount = (listData && listData.totalRows) || length;
        const dataListProps: IDetailsListProps = Object.assign({ ref: "detailList" },
            this.accquiredSelection ? { selection: this.accquiredSelection } : {},
            p, {

                onColumnHeaderClick: this.handleHeaderColumnClick,
                columns,
                onRenderRow: this.renderRow.bind(this),
                items, constraintMode: ConstrainMode.unconstrained,
                rowsCount,
                minHeight: p.height,
                listProps: {
                    style: { overflowX: 'visible' }
                }, onDidUpdate: this.handleDidUpdate


                //    constrainMode: ConstrainMode.unconstrained,
                // onCellSelected: ({ idx, rowIdx }) => (columns[idx].key == "__actions") && this.repatch({ popupActionForRowIndex: rowIdx })
            } as Partial<IDetailsListProps>, p.detailsListProps ? p.detailsListProps : {}) as any;
        const pagination = <Pagination
            {...{ totalPages, totalRows }}
            loadingPageIndex={s.loadingPageIndex}
            currentPageIndex={s.currentPageIndex}
            disabled={s.isLoading}
            onPageIndexChange={this.changePage.bind(this)} />;
        const isLoaded = (!!this.refs.root && !!items);
        console.log('paging-info>>>',s.noPaging,totalRows);
        return <div
            ref="parent"
            className={Utils.classNames("data-list", s.isLoading && 'loading-state shine-me', p.flexMode && 'flex-mode'/*, p.paginationMode*/)}
        >
            <i className="shine-me-child" />
            {isLoaded ?
                <ScrollablePanel
                    key={((this.items && this.items.length) || 0)}
                    ignore={this.props.ignoreScroll}
                    onSyncScroll={this.handleSyncScroll.bind(this)}
                    onGetWidth={this.getFullWidth}
                    onGetHeight={this.getFullHeight}
                >

                    <div className="data-list-content" ref="content">
                        <div className="data-list-c1    " style={{
                            overflowY: 'visible',
                            overflowX: 'visible',
                            flex: '1', display: 'block'
                        }}
                        >
                            {this.detailList = this.detailList || React.createElement(DetailsList, dataListProps)}

                        </div>

                    </div>
                </ScrollablePanel>
                : this.showSpinner()}
            {!s.noPaging && (totalPages > 1) && !!pagination && this && <div style={{ padding: '0 4px', maxHeight: '60px', minHeight: '60px' }}  >
                {pagination}

            </div>}
        </div>
    }
    showSpinner() {
        return <Spinner />
    }
    static getSelectionClass() {
        return Selection;
    }
}
Object.assign(window, { fakeLength });