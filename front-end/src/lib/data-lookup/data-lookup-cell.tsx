import { BaseComponent } from "../core/base-component";
import { IActionsForCRUD, IOptionsForCRUD } from "@organic-ui";
import { Spinner } from "../core/spinner";

interface DataLookupCellProps {
    actions: IActionsForCRUD<any>;
    options: IOptionsForCRUD;
    value: any;
    noRemove?: boolean;
    text?: any;
   
}
export class DataLookupCell extends BaseComponent<DataLookupCellProps, any>{
    static cache = {};
    state: {
        result: any;
        refId: number;
    }
    getListViewName() {
        const opts = this.props.options;
        if (opts)
            return opts.singularName || this.props.options.pluralName;
        const actions = this.props.actions as any;
        if (actions)
            return actions.singularName || actions.pluralName || actions.key;

    }
    static cellsByCacheId: { [key: string]: DataLookupCell[] } = {};
    static cellRefsByCacheId: { [key: string]: Object } = {};
    static repatchAllByCacheId(cacheId, delta) {
        const cells = DataLookupCell.cellsByCacheId[cacheId];

        if (cells instanceof Array)
            cells.forEach(cell => cell.repatch(delta));
    }
    render() {
        const {options:o}=this.props ;
        const p = this.props;
        if (p.text)
            return <span className="data-lookup-cell" data-value={JSON.stringify(this.props.value)}
                data-singularName={o && o.singularName} > {p.text}</span>;
        if (p.value) {
            const cacheId = this.getListViewName() + p.value;
            const { refId } = this.state;
            DataLookupCell.cellRefsByCacheId[cacheId] = DataLookupCell.cellRefsByCacheId[cacheId] || {};
            if (!DataLookupCell.cellRefsByCacheId[cacheId][refId]) {
                DataLookupCell.cellsByCacheId[cacheId] = DataLookupCell.cellsByCacheId[cacheId] || [];
                DataLookupCell.cellsByCacheId[cacheId].push(this);
            }
            Object.assign(DataLookupCell.cellRefsByCacheId[cacheId], { [refId]: 1 });
            if (this.state.result === undefined)
                this.state.result = DataLookupCell.cache[cacheId] = DataLookupCell.cache[cacheId] || (p.value &&
                    p.actions && p.actions.read && (p.actions as any).read(this.props.value)
                        .then(dto => p.actions.getText(dto))
                        .then(result => {
                            console.assert(!!result, 'invalid GetText', p.actions);
                            return DataLookupCell.cache[cacheId] = result || 'invalid GetText';
                        })
                        .then(result => {
                            DataLookupCell.repatchAllByCacheId(cacheId, { result });
                            this.repatch({ result });
                        }));
        }
        return <span className="data-lookup-cell" data-value={JSON.stringify(this.props.value)}
            data-singularName={o && o.singularName} >
            {this.state.result instanceof Promise ? <Spinner /> : (this.state.result || '')}</span>;
    }
}

