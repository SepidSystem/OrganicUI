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
import { IColumn, ConstrainMode, IDetailsListProps } from 'office-ui-fabric-react/lib/DetailsList';


interface IPaginationProps {
    currentPageIndex: number;
    loadingPageIndex?: number;
    totalPages: number;
    onPageIndexChange: (index: number) => void;

}
const defaultNormalPageCount = 3;
const pagination: FuncComponent<IPaginationProps, any> = (p, s, repatch) => {

    const targetPageIndex = (p.loadingPageIndex === undefined || p.loadingPageIndex < 0) ? p.currentPageIndex : p.loadingPageIndex;
    const ellipsis = (<li className=""><span className="pagination-ellipsis">&hellip;</span></li>);
    return <nav key="pagination" className="pagination   is-centered" role="navigation" aria-label="pagination">
        <Button variant="raised" className="pagination-previous" disabled={targetPageIndex <= 0} onClick={() => p.onPageIndexChange(targetPageIndex - 1)}>{i18n('previous-page')}</Button>
        <Button  variant="raised" className="pagination-next" disabled={targetPageIndex >= p.totalPages - 1} onClick={() => p.onPageIndexChange(targetPageIndex + 1)} >{i18n('next-page')}</Button>

        <ul key="pagination-list" className="pagination-list">

            {Array.from({ length: p.totalPages }, (_, idx) => idx)
                .filter(idx => (idx == 0) || (idx == p.totalPages - 1) || (idx > (targetPageIndex - defaultNormalPageCount) && idx < (targetPageIndex + defaultNormalPageCount)) || (idx == p.totalPages - 1))
                .map(n => (
                    [
                        n == p.totalPages - 1 && ((p.totalPages - targetPageIndex) >= (defaultNormalPageCount * 2) - 1)
                        && ellipsis,
                        <li key={n} className="">
                            <Button variant="flat"
                                className={Utils.classNames(n === p.loadingPageIndex ? "button is-loading" : "", "pagination-link", targetPageIndex == n && 'is-current')}
                                onClick={e => {
                                    if (p.loadingPageIndex > 0) return;
                                    e.preventDefault(), p.onPageIndexChange instanceof Function && p.onPageIndexChange(n);
                                }

                                }
                            >{n + 1}</Button>
                        </li>,
                        n == 0 && (targetPageIndex >= (defaultNormalPageCount * 2) - 1) && ellipsis
                    ]
                ))}

        </ul>
    </nav >
};
export const Pagination = funcAsComponentClass<IPaginationProps, IPaginationProps>(pagination);
//----------------------------------------------------------------------------------------

export interface IDataListState {
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
}
let randomStrings = {};

function defaultEmptyResult(p: OrganicUi.IDataListProps<any>) {
    return <div className="">no-result</div>;
}
/*
const rowRenderer = p => (
    !p.row || !p.row.__isLoading ? React.createElement(ReactDataGrid.Row, p) : <div className="react-loading-row" >
        {React.createElement(ReactDataGrid.Row, p)}
        <Spinner />
    </div >);
    */
export class DataList extends BaseComponent<OrganicUi.IDataListProps<any>, IDataListState> implements IDeveloperFeatures {
    items: any[];
    rowCount: number;
    static defaultProps = {
        itemHeight: 42,
        paginationMode: 'paged'
    }
    refs: {
        root: HTMLElement;
        parent: HTMLElement;
        content: HTMLElement;
        detailList: DetailsList;
    }
    static Templates = openRegistry<Function>()
    devPortId: number;
    detailList: JSX.Element;

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

        const defaultState: Partial<IDataListState> = { startFrom: 0, ratio: 0 };
        this.state = this.state || defaultState as any;
        Object.assign(this.state, defaultState);

        this.cache = LRU(4 * 1000);
        Object.assign(this.state, { loadingPageIndex: 0 });
        this.handleScroll = this.handleScroll.bind(this);
        this.adjustScroll = this.adjustScroll.bind(this);
        this.handleDoubleClick = this.handleDoubleClick.bind(this);

    }

    cache: Cache<number, any>;
    lastDataLoading = new Date();
    loadDataIfNeeded(startFrom: number, { forcedMode, currentPageIndex, resetCache, loadingPageIndex } = { loadingPageIndex: -1, resetCache: false, forcedMode: false, currentPageIndex: 0 }) {

        const s = this.state, p = this.props;
        if (!p.loader) return null;
        this.items = null;
        let fetchableRowCount = this.rowCount || 10;
        //if (s.isLoading) return;11
        resetCache && this.cache.reset();
        Object.assign(this.state, { isLoading: true }, p.paginationMode == 'scrolled' ? { startFrom } : {});
        this.lastDataLoading = new Date();
        if (fetchableRowCount < 0) fetchableRowCount = 0;
        const params = { startFrom, rowCount: fetchableRowCount, };
        const promise = Utils.toPromise(this.props.loader(
            this.props.onLoadRequestParams instanceof Function ? this.props.onLoadRequestParams(params)
                : params
        ));

        return promise instanceof Promise && promise.then(listData => {
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
            this.detailList = null;

            this.repatch({
                loadingPageIndex
                , listData, isLoading: false, currentPageIndex
            });

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
        const columnArray: React.ReactElement<IFieldProps>[] = this.props.children instanceof Array ? this.props.children as any : [this.props.children];
        const textReaders = columnArray.filter(col => col && (col.type == Field)).map(fld => Field.prototype.getTextReader.apply(fld))
        const columns: IColumn[] =
            columnArray.filter(col => col && (col.type == Field))
                .map((col, idx) => Object.assign({}, col.props || {}, {
                    key: Field.getAccessorName(col.props.accessor),
                    name: Field.getLabel(col.props.accessor, col.props.label),

                    maxWidth: (col.props.columnProps && col.props.columnProps.maxWidth) || 300, onRender: (item?: any, index?: number, column?: IColumn) => {
                        const textReader = textReaders[idx];
                        const displayText = textReader instanceof Function ? textReader(item[column.key]) : item[column.key];
                        return col.props.onRenderCell instanceof Function ? col.props.onRenderCell(item, index, column) : displayText;
                    }
                } as Partial<IColumn>, col.props.columnProps || {}) as IColumn)

        const { listData, startFrom } = this.state;
        const p = this.props, s: IDataListState = this.state;
        s.listData = s.listData || (!p.startWithEmptyList && this.loadDataIfNeeded(+s.startFrom)) as any;
        const length = this.rowCount || 10;

        let items = this.items =
            (s.noPaging ? s.listData && s.listData.rows :
                Array.from({ length }, (_, idx) => this.cache.get(startFrom + idx))) || [];

        if (!items) items = [];
        items = items.filter(x => !!x);
        const dataListProps: IDetailsListProps = Object.assign({ ref: "detailList" }, p, {
            columns,
            items, constraintMode: ConstrainMode.horizontalConstrained,
            rowsCount: (p.paginationMode == 'scrolled'
                ? (!!listData ? listData.totalRows : length)
                : (!!listData && length)),
            minHeight: p.height,
            //    constrainMode: ConstrainMode.unconstrained,
            // onCellSelected: ({ idx, rowIdx }) => (columns[idx].key == "__actions") && this.repatch({ popupActionForRowIndex: rowIdx })
        } as Partial<IDetailsListProps>, p.detailsListProps ? p.detailsListProps : {}) as any;
        const { itemHeight } = this.props;
        const totalPages = listData && Math.ceil(listData.totalRows / (length || 10)) || 0;
        const pagination = p.paginationMode != 'scrolled' && !!listData
            && <Pagination
                totalPages={totalPages}
                loadingPageIndex={s.loadingPageIndex}
                currentPageIndex={s.currentPageIndex}
                onPageIndexChange={pageIndex => {
                    this.repatch({ loadingPageIndex: pageIndex });
                    this.loadDataIfNeeded(pageIndex * length, { loadingPageIndex: -1, resetCache: true, forcedMode: true, currentPageIndex: pageIndex });


                }} />;

        return (
            <div ref="root" onDoubleClick={this.handleDoubleClick}
                data-height={p.height} style={p.flexMode ? {} : { minHeight: p.height + 'px' }}
                className={Utils.classNames("data-list-wrapper developer-features", p.className)} data-flex-mode={p.flexMode}>
                <div onScroll={p.paginationMode == 'scrolled' ? this.handleScroll : null}
                    ref="parent"
                    className={Utils.classNames("data-list", p.flexMode && 'flex-mode', p.paginationMode)}
                >

                    {!!this.refs.root && items &&
                        <div className="data-list-content" ref="content">
                            <div className="data-list-c1" style={{
                                overflowY: p.flexMode ? 'scroll' : null, flex: '1'
                            }} >
                                {this.detailList = this.detailList || React.createElement(DetailsList, dataListProps)}
                            </div>
                            {!s.noPaging && (totalPages > 1) && !!pagination && this && <div style={{ padding: '0 4px', maxHeight: '60px', minHeight: '60px' }}  >
                                {pagination}

                            </div>}
                        </div>}

                </div>

            </div>
        );
    }

}
