/// <reference path="../../dts/globals.d.ts" />   
import { BaseComponent } from '../core/base-component';
import { icon, i18n } from '../core/shared-vars';
import { openRegistry } from '../core/registry';
import { funcAsComponentClass } from '../core/functional-component';
import { Spinner } from '../core/spinner';
import { Utils, changeCase } from '../core/utils';
import { Cache } from 'lru-cache';
import { Field } from '../data/field';
import { IListData, IDeveloperFeatures, IFieldProps } from '@organic-ui';
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

        const targetPageIndex = p.loadingPageIndex < 0 ? p.currentPageIndex : p.loadingPageIndex;
        const pushNum = n => (n > 0) && (n < p.totalPages - 1) && !pageNumbers.includes(n) && pageNumbers.push(n);
        const pageNumbers = [];

        for (let i = -defaultNormalPageCount; i < defaultNormalPageCount; i++) {
            pushNum(i + targetPageIndex);

        }
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
            <span className="pagination-next" style={{ display: 'flex' }} >

                <Button variant="raised" disabled={targetPageIndex >= p.totalPages - 1} data-loading-idx={p.loadingPageIndex} onClick={() => p.loadingPageIndex < 0 && p.onPageIndexChange(targetPageIndex + 1)} >{Utils.showIcon('fa-chevron-left')}</Button>
            </span>
            <ul key="pagination-list" className="pagination-list">
                {this.showButton(targetPageIndex, 0)}
                {!pageNumbers.includes(1) && pageNumbers.length && ellipsis}
                {pageNumbers.map(this.showButton.bind(this, targetPageIndex))}
                {!pageNumbers.includes(p.totalPages - 2) && (p.totalPages >= defaultNormalPageCount) && ellipsis}
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
    refs: {
        root: HTMLElement;
        parent: HTMLElement;
        content: HTMLElement;
        detailList: DetailsList;
    }
    static Templates = openRegistry<Function>()
    devPortId: number;
    detailList: JSX.Element;
    bestFitColumnWidths: number[];
    lastModForBestFitColumnWidths: number;
    fields: { [key: string]: React.ReactElement<IFieldProps> };
    getFakeItems(length) {
        return Array.from({ length }, (_, idx) => idx);
    }
    reload() {
        this.detailList = null;
        this.items = null;
        const s = this.state;
        this.cache.reset();
        this.items = [];
        return Utils.toPromise(this.loadDataIfNeeded(+s.startFrom));
    }
    constructor(p: OrganicUi.IDataListProps<any>) {
        super(p);
        this.devPortId = Utils.accquireDevPortId();
        this.rowCount = p.rowCount;
        const defaultState: Partial<IState> = { startFrom: 0, ratio: 0 };
        this.state = this.state || defaultState as any;
        Object.assign(this.state, defaultState);

        this.cache = LRU(4 * 1000);
        Object.assign(this.state, { loadingPageIndex: 0 });
        this.handleScroll = this.handleScroll.bind(this);
        this.adjustScroll = this.adjustScroll.bind(this);
        this.handleDoubleClick = this.handleDoubleClick.bind(this);
        this.lastModForBestFitColumnWidths = 0;

    }

    cache: Cache<number, any>;
    lastDataLoading = new Date();
    accquiredSelection: any;
    async callAction(row, rowIndex, func: Function) {
        const updatedRow = Utils.clone(await Utils.toPromise(func(row, rowIndex)));
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
                <Button onClick={this.callAction.bind(this, row, rowIndex, this.props.customActions[funcKey])} >
                    {this.props.customActionRenderer(funcKey, this.props.customActions[funcKey])}
                </Button>
            ))}
        </div>
    }
    searchItems(searchingValue) {
        this.repatch({ searchingValue });
    }
    loadDataIfNeeded(startFrom: number, { forcedMode, currentPageIndex, resetCache, loadingPageIndex, avoidShowData, rowCount } = { loadingPageIndex: -1, resetCache: false, forcedMode: false, currentPageIndex: 0, avoidShowData: false, rowCount: 0 }) {
        const s = this.state, p = this.props;
        if (!p.loader) return null;
        if (!avoidShowData) this.items = null;
        let fetchableRowCount = rowCount || p.rowCount || this.rowCount || 10;
        //if (s.isLoading) return;11
        resetCache && this.cache.reset();
        if (!avoidShowData) {
            Object.assign(this.state, { isLoading: true }, p.paginationMode == 'scrolled' ? { startFrom } : {})
            setTimeout(() => {
                if (this.state.isLoading) {
                    this.detailList = null;

                    this.repatch({});
                }
            }, 1000);
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
        const promise = Utils.toPromise(this.props.loader(paramsForLoaders));

        return promise instanceof Promise && promise.then(listData => {
            if (avoidShowData) return listData;
            if (listData instanceof Array) {
                this.repatch({ noPaging: true });
                listData = { rows: listData, totalRows: listData.length };
            }

            if (listData && listData.rows) {
                if (p.paginationMode == 'scrolled')
                    listData.rows.forEach((row, idx) => this.cache.set(idx + (s.startFrom || 0), row));
                else
                    listData.rows.forEach((row, idx) => this.cache.set(idx, row));
            }
            //this.rowCount = Math.max(listData.rows.length, Number.isNaN(this.rowCount) ? 0 : (this.rowCount || 0));
            this.detailList = null;

            this.repatch({ loadingPageIndex, listData, isLoading: false, currentPageIndex });
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
    adjustScroll() {
        if (this.props.paginationMode == 'scrolled') {
            this.scrollTimer && clearTimeout(this.scrollTimer);
            this.scrollTimer = null;
            const { content, root } = this.refs;
            const { listData } = this.state;
            const ratio = listData ? (root.scrollTop / (content && content.clientHeight)) : 0;
            const diffRatio = (ratio - this.state.ratio) * 100;
            let { startFrom } = this.state;
            if (root.scrollTop == 0) startFrom = 0;
            const { itemHeight, height } = this.props;
            let times = Math.abs(Math.floor(diffRatio / 0.001));
            if (times < 1) times = 1
            if (times > 2)
                startFrom += this.rowCount * times * (Math.sign(diffRatio));
            else
                startFrom = ratio * listData.totalRows;
            if (startFrom < 0) startFrom = 0;
            this.repatch({ startFrom, listData: null, ratio });
        }

    }
    handleScroll() {
        this.scrollTimer && clearTimeout(this.scrollTimer);
        this.scrollTimer = setTimeout(this.adjustScroll, 50);
        this.repatch({});
    }
    handleDoubleClick(e: React.MouseEvent<any>) {
        this.props.onDoubleClick && this.props.onDoubleClick();
    }
    scrollToIndex(index) {
        this.refs.detailList.scrollToIndex(index);
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
            (s.noPaging ? s.listData && s.listData.rows :
                Array.from({ length }, (_, idx) => this.cache.get(startFrom + idx))) || [];

        if (s.isLoading) items = this.getFakeItems(length);
        items = items.filter(x => !!x);
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
        const { itemIsDisabled } = this.props;
        const rowIsDisabled = itemIsDisabled instanceof Function && itemIsDisabled(props.item);
        props.className = Utils.classNames(rowIsDisabled && "row-disabled", props.className);
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
    handleDidUpdate(detailList: DetailsList) {
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
    renderItems(items: any[]) {
        const length = this.rowCount || 10;
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
                        const displayText = textReader instanceof Function ? textReader(item[column.key]) : item[column.key];
                        return col.props.onRenderCell instanceof Function ? col.props.onRenderCell(item, index, column) : displayText;
                    }
                } as Partial<IColumn>, col.props.columnProps || {}) as IColumn)
        if (p.customActions && p.customActionRenderer) {
            columns.push({ key: columns[0].key, name: ' ', fieldName: columns[0].fieldName, onRender: this.getCustomActions.bind(this) })
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
        const rowsCount = (p.paginationMode == 'scrolled'
            ? (!!listData ? listData.totalRows : length)
            : (!!listData && length))
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
        const pagination = p.paginationMode != 'scrolled' && !!s.listData
            && <Pagination
                {...{ totalPages, totalRows }}
                loadingPageIndex={s.loadingPageIndex}
                currentPageIndex={s.currentPageIndex}
                disabled={s.isLoading}
                onPageIndexChange={pageIndex => {
                    this.repatch({ loadingPageIndex: pageIndex });
                    this.loadDataIfNeeded(pageIndex * length, { loadingPageIndex: -1, rowCount: 0, resetCache: true, forcedMode: true, currentPageIndex: pageIndex, avoidShowData: false });


                }} />;
        const isLoaded = (!!this.refs.root && !!items);
        //  console.log({ isLoaded, items, root: this.refs.root });
        return <div /*onScroll={p.paginationMode == 'scrolled' ? this.handleScroll : null}*/
            ref="parent"
            className={Utils.classNames("data-list", s.isLoading && 'shine-me', p.flexMode && 'flex-mode'/*, p.paginationMode*/)}
        >
            <i className="shine-me-child" />
            {isLoaded ?
                <div className="data-list-content" ref="content">
                    <div className="data-list-c1" style={{
                        overflowX: 'auto',
                        flex: '1', display: 'block'
                    }} onMouseEnter={this.handleMouseEnter}
                        onMouseLeave={this.handleMouseLeave}
                    >
                        {this.detailList = this.detailList || React.createElement(DetailsList, dataListProps)}

                    </div>
                    {!s.noPaging && (totalPages > 1) && !!pagination && this && <div style={{ padding: '0 4px', maxHeight: '60px', minHeight: '60px' }}  >
                        {pagination}

                    </div>}
                </div>
                : this.showSpinner()}

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