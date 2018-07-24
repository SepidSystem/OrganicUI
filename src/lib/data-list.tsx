/// <reference path="../dts/globals.d.ts" />   
import { BaseComponent } from './base-component';
import { icon, i18n } from './shared-vars';
import { openRegistry } from './registry';
import { funcAsComponentClass } from './functional-component';
import { Spinner } from './spinner';
import { Utils, changeCase } from './utils';
import { DeveloperBar } from '../organicUI';

import { Cache } from 'lru-cache';
import { Field } from './data';
import { IListData, IDeveloperFeatures, IFieldProps } from '@organic-ui';
import { DetailsList } from './inspired-components';
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
    return (p.totalPages > 1) && <nav key="pagination" className="pagination   is-centered" role="navigation" aria-label="pagination">
        <button className="pagination-previous" disabled={targetPageIndex <= 0} onClick={() => p.onPageIndexChange(targetPageIndex - 1)}>{i18n('previous-page')}</button>
        <button className="pagination-next" disabled={targetPageIndex >= p.totalPages - 1} onClick={() => p.onPageIndexChange(targetPageIndex + 1)} >{i18n('next-page')}</button>

        <ul key="pagination-list" className="pagination-list">

            {Array.from({ length: p.totalPages }, (_, idx) => idx)
                .filter(idx => (idx == 0) || (idx == p.totalPages - 1) || (idx > (targetPageIndex - defaultNormalPageCount) && idx < (targetPageIndex + defaultNormalPageCount)) || (idx == p.totalPages - 1))
                .map(n => (
                    [
                        n == p.totalPages - 1 && ((p.totalPages - targetPageIndex) >= (defaultNormalPageCount * 2) - 1)
                        && ellipsis,
                        <li key={n} className="">
                            <a onClick={e => (e.preventDefault(), p.onPageIndexChange instanceof Function && p.onPageIndexChange(n))} className={Utils.classNames(n === p.loadingPageIndex ? "button is-loading" : "", "pagination-link", targetPageIndex == n && 'is-current')}  >{n + 1}</a>
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

function defaultEmptyResult(p: OrganicUi.IDataListProps) {
    return <div className="">no-result</div>;
}
/*
const rowRenderer = p => (
    !p.row || !p.row.__isLoading ? React.createElement(ReactDataGrid.Row, p) : <div className="react-loading-row" >
        {React.createElement(ReactDataGrid.Row, p)}
        <Spinner />
    </div >);
    */
export class DataList extends BaseComponent<OrganicUi.IDataListProps, IDataListState> implements IDeveloperFeatures {
    items: any[];
    rowCount: number;
    static defaultProps = {
        itemHeight: 42,
        paginationMode: 'paged'
    }
    refs: {
        root, content: HTMLElement;
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
        const listData = this.loadDataIfNeeded(+s.startFrom) as any;
        listData instanceof Promise && listData.then(listData => this.repatch({ listData }));
        return listData;
    }
    constructor(p: OrganicUi.IDataListProps) {
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
        this.calcRowCount();
    }
    calcRowCount() {
        this.rowCount = Math.floor(this.props.height / this.props.itemHeight) - 1;
    }
    cache: Cache<number, any>;
    lastDataLoading = new Date();
    loadDataIfNeeded(startFrom: number, { forcedMode, currentPageIndex, resetCache, loadingPageIndex } = { loadingPageIndex: -1, resetCache: false, forcedMode: false, currentPageIndex: 0 }) {

        const s = this.state, p = this.props;
        if (!p.loader) return null;
        this.items = null;
        let fetchableRowCount = (this.rowCount || 10) * 4;
        if (s.isLoading) return;
        resetCache && this.cache.reset();
        Object.assign(this.state, { isLoading: true }, p.paginationMode == 'scrolled' ? { startFrom } : {});
        this.lastDataLoading = new Date();
        if (fetchableRowCount < 0) fetchableRowCount = 0;
        const params = { startFrom, rowCount: fetchableRowCount, };
        const promise = this.props.loader(
            this.props.onLoadRequestParams instanceof Function ? this.props.onLoadRequestParams(params)
                : params
        );

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
        });
    }
    scrollTimer: any;
    getDevButton() {
        return Utils.renderDevButton('DataList', this);
    }
    adjustScroll() {
        this.scrollTimer && clearTimeout(this.scrollTimer);
        this.scrollTimer = null;
        const { content, root } = this.refs;
        const { listData } = this.state;
        const ratio = listData ? (root.scrollTop / content.clientHeight) : 0;
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
    handleScroll() {
        this.scrollTimer && clearTimeout(this.scrollTimer);
        this.scrollTimer = setTimeout(this.adjustScroll, 50);
        this.repatch({});

    }
    handleDoubleClick(e: React.MouseEvent<any>) {
        this.props.onDoubleClick && this.props.onDoubleClick();
    }
    renderContent() {
        this.calcRowCount();
        const columnArray: React.ReactElement<IFieldProps>[] = this.props.children instanceof Array ? this.props.children as any : [this.props.children];
        const textReaders = columnArray.filter(col => col && (col.type == Field)).map(fld => Field.prototype.getTextReader.apply(fld))
        const columns: IColumn[] =
            columnArray.filter(col => col && (col.type == Field))
                .map((col, idx) => Object.assign({}, col.props || {}, {
                    key: col.props.accessor, name: i18n(col.props.label || changeCase.paramCase(col.props.accessor))
                    , maxWidth: 300, onRender: (item?: any, index?: number, column?: IColumn) => {
                        const textReader = textReaders[idx];
                        const displayText = textReader instanceof Function ? textReader(item[column.key]) : item[column.key];
                        return col.props.onRenderCell instanceof Function ? col.props.onRenderCell(item, index, column) : displayText;
                    }
                } as Partial<IColumn>) as IColumn)

        const { listData, startFrom } = this.state;
        const p = this.props, s: IDataListState = this.state;
        s.listData = s.listData || this.loadDataIfNeeded(+s.startFrom) as any;
        const length = this.rowCount || 10;

        let items =  
            (s.noPaging ? s.listData && s.listData.rows :
                Array.from({ length }, (_, idx) => this.cache.get(startFrom + idx))) || [];

        if (!items) items = [];
        items = items.filter(x => !!x);
        const dataListProps: IDetailsListProps = Object.assign({ ref: "detailList" }, p, {
            columns,
            items,
            rowsCount: (p.paginationMode == 'scrolled'
                ? (!!listData ? listData.totalRows : length)
                : (!!listData && length)),
            minHeight: p.height,
            constrainMode: ConstrainMode.unconstrained,
            // onCellSelected: ({ idx, rowIdx }) => (columns[idx].key == "__actions") && this.repatch({ popupActionForRowIndex: rowIdx })
        } as Partial<IDetailsListProps>) as any;
        const { itemHeight } = this.props;
        const pagination = p.paginationMode != 'scrolled' && !!listData
            && <Pagination
                totalPages={Math.ceil(listData.totalRows / (length || 10))}
                loadingPageIndex={s.loadingPageIndex}
                currentPageIndex={s.currentPageIndex}
                onPageIndexChange={pageIndex => {
                    this.repatch({ loadingPageIndex: pageIndex });
                    this.loadDataIfNeeded(pageIndex * length, { loadingPageIndex: -1, resetCache: true, forcedMode: true, currentPageIndex: pageIndex });


                }} />;

        return (
            <div ref="root" onDoubleClick={this.handleDoubleClick} className="data-list">

                {!!p.height && <div onScroll={p.paginationMode == 'scrolled' ? this.handleScroll : null} className={Utils.classNames("developer-features", "data-list", p.paginationMode)} style={{ minHeight: (p.height + 'px') }} >
                    <div className="data-list-content" ref="content"

                        style={{ minHeight: p.paginationMode == 'scrolled' ? parseInt('' + (s.listData.totalRows * itemHeight)) + 'px' : 'auto' }}>
                    </div>
                    {this.refs.root && items && <div className="data-list-c1" style={p.paginationMode == 'scrolled' ? {
                        height: p.height + 'px',
                        position: 'absolute', top:
                            ((this.refs.root && Math.floor(this.refs.root.scrollTop)) || 0) + 'px'
                    } : null} >
                        {this.detailList = this.detailList || React.createElement(DetailsList, dataListProps)}
                        <div className="columns">
                            {p.corner && <div className="column corner">{p.corner}</div>}
                            {!s.noPaging && pagination && <div className="column pagination">{pagination}</div>}

                        </div>
                    </div>}

                </div>}
            </div>
        );
    }

}
