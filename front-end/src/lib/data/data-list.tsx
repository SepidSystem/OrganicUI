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
import { DetailsList, FocusZone, Button } from '../controls/inspired-components';
import { IColumn, ConstrainMode, IDetailsListProps, Selection, IDetailsRowProps } from 'office-ui-fabric-react/lib/DetailsList';
import { SelfBind } from '../core/decorators';


interface IPaginationProps {
    currentPageIndex: number;
    loadingPageIndex?: number;
    totalPages: number;
    onPageIndexChange: (index: number) => void;

}
const defaultNormalPageCount = 2;
const pagination: FuncComponent<IPaginationProps, any> = (p, s, repatch) => {

    const targetPageIndex = p.currentPageIndex;
    const pushNum = n => (n > 0) && (n < p.totalPages - 1) && !pageNumbers.includes(n) && pageNumbers.push(n);
    const pageNumbers = [];
    const showButton = n => (<li key={n} className="">
        <Button variant="flat"
            className={Utils.classNames(n === p.loadingPageIndex ? "button is-loading" : "", "pagination-link", targetPageIndex == n && 'is-current')}
            onClick={e => {
                if (p.loadingPageIndex > 0) return;
                e.preventDefault(), p.onPageIndexChange instanceof Function && p.onPageIndexChange(n);
            }

            }
        >{n + 1}</Button>
    </li>)
    for (let i = -defaultNormalPageCount; i < defaultNormalPageCount; i++) {
        pushNum(i + targetPageIndex);

    }
    const ellipsis = (<li className=""><span className="pagination-ellipsis">&hellip;</span></li>);
    return <nav key="pagination" className="pagination   is-centered" role="navigation" aria-label="pagination">
        <Button variant="raised" className="pagination-previous" disabled={targetPageIndex <= 0} onClick={() => p.loadingPageIndex < 0 && p.onPageIndexChange(targetPageIndex - 1)}>{i18n('previous-page')}</Button>
        <Button variant="raised" className="pagination-next" disabled={targetPageIndex >= p.totalPages - 1} data-loading-idx={p.loadingPageIndex} onClick={() => p.loadingPageIndex < 0 && p.onPageIndexChange(targetPageIndex + 1)} >{i18n('next-page')}</Button>

        <ul key="pagination-list" className="pagination-list">
            {showButton(0)}
            {!pageNumbers.includes(1) && pageNumbers.length && ellipsis}
            {pageNumbers.map(showButton)}
            {!pageNumbers.includes(p.totalPages - 2) && (p.totalPages >= defaultNormalPageCount) && ellipsis}
            {showButton(p.totalPages - 1)}

        </ul>
    </nav >
};
export const Pagination = funcAsComponentClass<IPaginationProps, IPaginationProps>(pagination);
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
}
let randomStrings = {};

function defaultEmptyResult(p: OrganicUi.IDataListProps<any>) {
    return <div className="">no-result</div>;
}
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

        console.log(row);
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
            Object.assign(this.state, { isLoading: true }, p.paginationMode == 'scrolled' ? { startFrom } : {});
            this.lastDataLoading = new Date();
        }
        if (fetchableRowCount < 0) fetchableRowCount = 0;
        const params = { startFrom, rowCount: fetchableRowCount };
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
        const { startFrom } = s;
        s.listData = s.listData || (!p.startWithEmptyList && this.loadDataIfNeeded(+startFrom)) as any;
        const length = this.rowCount || 10;
        let items = this.items =
            (s.noPaging ? s.listData && s.listData.rows :
                Array.from({ length }, (_, idx) => this.cache.get(startFrom + idx))) || [];

        if (!items) items = [];
        items = items.filter(x => !!x);

        return (
            <div ref="root" onDoubleClick={this.handleDoubleClick}
                data-height={p.height} style={p.flexMode ? {} : { minHeight: p.height + 'px' }}
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
            Math.min(len * 15,
                Math.max(len * 10, Math.round((len * totalWidth) / totalLengths))));
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
        setTimeout(() => {
            const { root } = this.refs;
            if (!root) return;
            const now = +new Date();
            if (this.lastDidUpdateTime && (now - this.lastDidUpdateTime < 3000)) {
                return;
            }
            const focusZone = root.querySelector('.ms-SelectionZone') as HTMLElement;
            if (!focusZone) return;
            let targetNode = focusZone;
            while (targetNode) {
                targetNode.style.minWidth = Math.max(targetNode.clientWidth, focusZone.clientWidth) + 'px';
                if (targetNode.classList.contains('ms-Viewport')) break;
                targetNode = targetNode.parentElement;
            }
            this.lastDidUpdateTime = +new Date();
        }, 1500);
    }
    handleMouseEnter(e: React.MouseEvent<HTMLElement>) {
        const msList = e.currentTarget.querySelector('.ms-List');
        msList && msList.classList.add('scrollY');
    }
    handleMouseLeave(e: React.MouseEvent<HTMLElement>) {
        const msList = e.currentTarget.querySelector('.ms-List');
        msList && msList.classList.remove('scrollY');
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
                    name: Field.getLabel(col.props.accessor, col.props.label),
                    maxWidth: (col.props.columnProps && col.props.columnProps.maxWidth) || 300,
                    onRender: (item?: any, index?: number, column?: IColumn) => {
                        const textReader = textReaders[idx];
                        const displayText = textReader instanceof Function ? textReader(item[column.key]) : item[column.key];
                        return col.props.onRenderCell instanceof Function ? col.props.onRenderCell(item, index, column) : displayText;
                    }
                } as Partial<IColumn>, col.props.columnProps || {}) as IColumn)
        if (p.customActions && p.customActionRenderer) {
            columns.push({ key: columns[0].key, name: ' ', fieldName: columns[0].fieldName, onRender: this.getCustomActions.bind(this) })
        }
        const totalPages = listData && Math.ceil(listData.totalRows / (length)) || 0;
        const now = +new Date();
        if (!this.props.noBestFit) {
            if ((now - this.lastModForBestFitColumnWidths) > 500 && root && items && items.length) {
                this.bestFitColumnWidths = DataList.bestFitColumn(root.clientWidth, columns, items);
                this.lastModForBestFitColumnWidths = +new Date();
            }
            if (this.bestFitColumnWidths) {
                columns.forEach((col, idx) => Object.assign(col, { minWidth: col.minWidth || this.bestFitColumnWidths[idx] } as IColumn))
            }
        }
        const dataListProps: IDetailsListProps = Object.assign({ ref: "detailList" }, p, {
            columns,
            onRenderRow: this.renderRow.bind(this),
            items, constraintMode: ConstrainMode.unconstrained,

            rowsCount: (p.paginationMode == 'scrolled'
                ? (!!listData ? listData.totalRows : length)
                : (!!listData && length)),
            minHeight: p.height,
            listProps: {
                style: { overflowX: 'visible' }
            }, onDidUpdate: this.handleDidUpdate


            //    constrainMode: ConstrainMode.unconstrained,
            // onCellSelected: ({ idx, rowIdx }) => (columns[idx].key == "__actions") && this.repatch({ popupActionForRowIndex: rowIdx })
        } as Partial<IDetailsListProps>, p.detailsListProps ? p.detailsListProps : {}) as any;

        const pagination = p.paginationMode != 'scrolled' && !!s.listData
            && <Pagination
                totalPages={totalPages}
                loadingPageIndex={s.loadingPageIndex}
                currentPageIndex={s.currentPageIndex}
                onPageIndexChange={pageIndex => {
                    this.repatch({ loadingPageIndex: pageIndex });
                    this.loadDataIfNeeded(pageIndex * length, { loadingPageIndex: -1, rowCount: 0, resetCache: true, forcedMode: true, currentPageIndex: pageIndex, avoidShowData: false });


                }} />;

        return <div /*onScroll={p.paginationMode == 'scrolled' ? this.handleScroll : null}*/
            ref="parent"
            className={Utils.classNames("data-list", p.flexMode && 'flex-mode'/*, p.paginationMode*/)}
        >

            {(!!this.refs.root && items) ?
                <div className="data-list-content" ref="content">
                    <div className="data-list-c1" style={{
                        overflowX: 'scroll',
                        flex: '1'
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
