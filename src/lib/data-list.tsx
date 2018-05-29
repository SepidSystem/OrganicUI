/// <reference path="../organicUI.d.ts" />   
import { BaseComponent } from './base-component';
import { icon, i18n } from './shared-vars';
import { registryFactory } from './registry-factory';
import { funcAsComponentClass } from './functional-component';
import { Spinner } from './spinner';
import { Utils } from './utils';
import { DeveloperBar, DevFriendlyPort } from '../organicUI';
 
export interface IDataListLoadReq {
    startFrom: number;
    rowCount: number;

}

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
    return <nav className="pagination   is-centered" role="navigation" aria-label="pagination">
        <button className="pagination-previous" disabled={targetPageIndex <= 0} onClick={() => p.onPageIndexChange(targetPageIndex - 1)}>{i18n('previous-page')}</button>
        <button className="pagination-next" disabled={targetPageIndex >= p.totalPages - 1} onClick={() => p.onPageIndexChange(targetPageIndex + 1)} >{i18n('next-page')}</button>

        <ul className="pagination-list">

            {Array.from({ length: p.totalPages }, (_, idx) => idx)
                .filter(idx => (idx == 0) || (idx == p.totalPages - 1) || (idx > (targetPageIndex - defaultNormalPageCount) && idx < (targetPageIndex + defaultNormalPageCount)) || (idx == p.totalPages - 1))
                .map(n => (
                    [
                        n == p.totalPages - 1 && ((p.totalPages - targetPageIndex) >= (defaultNormalPageCount * 2) - 1)
                        && ellipsis,
                        <li className="">
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
export interface IDataListProps {
    loader?: (req: IDataListLoadReq) => Promise<IListData>;
    onCurrentRowChanged?: (row: any) => any;
    rowCount?: number;
    paginationMode?: 'paged' | 'scrolled';
    template?: string;
    height?: number;
    minWidth?: number;
    popupForActions?: React.ReactNode | Function;
    onRowClick?: (rowIdx: number, row: any) => void;
    rowSelection?: any;
    templatedApplied?: boolean;
}
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
}
let randomStrings = {};

function defaultEmptyResult(p: IDataListProps) {
    return <div className="">no-result</div>;
}
/*
const rowRenderer = p => (
    !p.row || !p.row.__isLoading ? React.createElement(ReactDataGrid.Row, p) : <div className="react-loading-row" >
        {React.createElement(ReactDataGrid.Row, p)}
        <Spinner />
    </div >);
    */
export class DataList extends BaseComponent<IDataListProps, IDataListState>{
    static Templates = registryFactory<Function>()
    constructor(p) {
        super(p);
        this.cache = LRU(4 * 1000);
        (this as any).state = {};
        Object.assign(this.state, { loadingPageIndex: 0 });
    }
   
    root: HTMLElement;
    cache:any;
    lastDataLoading = new Date();
    loadDataIfNeeded(startFrom: number, { forcedMode, currentPageIndex, resetCache, loadingPageIndex } = { loadingPageIndex: -1, resetCache: false, forcedMode: false, currentPageIndex: 0 }) {
        if(!this.props.loader) return null;
        const s = this.state, p = this.props;

        if (!forcedMode) {
            const { root } = this;
            if (root) {
                //    const spinner = root.querySelector('.spinner');
                //  if (!spinner) return;
            }
            startFrom -= 20;
            if (startFrom < 0) startFrom = 0;
        }
        if (s.isLoading) return;
        resetCache && this.cache.reset();
        Object.assign(this.state, { isLoading: true, startFrom });
        this.lastDataLoading = new Date();

        return this.props.loader(
            { startFrom, rowCount: (p.rowCount || 10) * 4, }
        ).then(listData => {
            if (p.paginationMode == 'scrolled')
                listData.rows.forEach((row, idx) => this.cache.set(idx + (s.startFrom || 0), row));
            else
                listData.rows.forEach((row, idx) => this.cache.set(idx, row));
            this.repatch({
                loadingPageIndex
                , listData, isLoading: false, currentPageIndex
            });
            return listData;
        });
    }
    rowGetter = idx => {
        const result = this.cache.get(idx);
        if (result) return result;
        this.loadDataIfNeeded(idx);
        return { __isLoading: true };
    }

    render() {
        const columnArray: React.ReactElement<ColumnProps>[] = this.props.children instanceof Array ? this.props.children as any : [this.props.children];
        const columns: any[] =
            columnArray.filter(col => col && (col.type == GridColumn)).map(col => Object.assign({}, col.props || {}, { key: col.props.accessor }) as any)
                .concat([{
                    name: "", accessor: "", key: "__isLoading", locked: true, cellClass: 'full-cell'
                    , width: 40
                }]);
        const { listData } = this.state;
        const p = this.props, s: IDataListState = this.state;
        s.listData = s.listData || this.loadDataIfNeeded(0) as any;
        const rowCount = p.rowCount || 10;

        const reactGridProps = Object.assign({}, {
            columns,
            //rowGetter: this.rowGetter,
            rowsCount: (p.paginationMode == 'scrolled'
                ? (!!listData ? listData.totalRows : rowCount)
                : (!!listData && rowCount)),
            minHeight: p.height,
            // onCellSelected: ({ idx, rowIdx }) => (columns[idx].key == "__actions") && this.repatch({ popupActionForRowIndex: rowIdx })
        }, p) as AdazzleReactDataGrid.GridProps;
        return (
            <DevFriendlyPort target={this} targetText="DataList">
            {!!p.height && <div className="" ref={root => this.root = root as any} >
                {React.createElement(FabricUI.DetailsList, reactGridProps)}
                {p.paginationMode != 'scrolled' && !!listData
                    && <Pagination
                        totalPages={Math.ceil(listData.totalRows / (rowCount || 10))}
                        loadingPageIndex={s.loadingPageIndex}
                        currentPageIndex={s.currentPageIndex} onPageIndexChange={pageIndex => {

                            this.repatch({ loadingPageIndex: pageIndex });
                            this.loadDataIfNeeded(pageIndex * rowCount, { loadingPageIndex: -1, resetCache: true, forcedMode: true, currentPageIndex: pageIndex });
                            ;

                        }

                        } />
                }

            </div>}
            </DevFriendlyPort>
        );
    }

}
interface ColumnProps extends Partial<AdazzleReactDataGrid.Column> {
    accessor: string;
    key?: string;
}
export function GridColumn(params: ColumnProps) {
    return <span />;
}