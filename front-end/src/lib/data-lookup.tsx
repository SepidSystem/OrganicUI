import { BaseComponent } from './base-component';
import { icon, i18n } from './shared-vars';
import { Utils } from './utils';
const { classNames } = Utils;

import { isDevelopmentEnv } from './developer-features';

import { ListViewBox } from './list-view-box';
import { Spinner } from './spinner';
import { Event } from './decorators';
import { IOptionsForCRUD, IActionsForCRUD } from '@organic-ui';
import OrganicBox from './organic-box';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import { TextField } from './inspired-components';

interface DataLookupProps {
    source: React.ComponentType<OrganicUi.IListViewParams>;
    className?: string;
    onChange?: (value) => void;
    onFocus?: () => void;
    onBlur?: Function;
    onDisplayText?: (value) => React.ReactNode;
    multiple?: boolean;
    value?: any;
    iconCode?: string;
    minHeightForPopup?: string;
}
interface DataLookupState {
    isOpen?: boolean;
    isActive?: boolean;
    isHidden?: boolean;
    value?: any | any[];
}
function closeAllPopup(activeDataLookup?) {
    const query = () => Array.from(document.querySelectorAll('.closable-element'))
        .map(element => element['componentRef'] as DataLookup)
        .forEach(dataLookup => activeDataLookup != dataLookup && dataLookup.closePopup({ isActive: false }));
    setTimeout(query, 300);
}
export class DataLookup extends BaseComponent<DataLookupProps, DataLookupState>{
    static defaultProps = {
        //iconCode: 'fa-search',
        minHeightForPopup: '300px'
    }
    static classNameForField = "data-lookup-field control-field-single-line";
    static textReader = (fld, prop: DataLookupProps, value) => {
        const { source } = prop as any;
        if (!source.listViewActions) {
            const listView = OrganicBox.extractOrganicBoxFromComponent(source);
            if (listView && listView.props) {
                source.listViewActions = Object.assign({}, listView.props.actions, listView.props.customActions);
                source.listViewOptions = listView.props.options;
            }
        }

        return <DataLookupCell actions={source.listViewActions} options={source.listViewOptions} value={value} />
    }
    listViewElement: React.ReactElement<OrganicUi.IListViewParams>;
    actionsForListViewBox: OrganicUi.IActionsForCRUD<any>;
    optionsForListViewBox: OrganicUi.IOptionsForCRUD;
    cache: { [key: string]: any };
    refs: {
        listViewContainer: HTMLElement;
        textField: any;
        root: HTMLElement;
        editorWrapper: HTMLElement;
        innerTextSpan: HTMLElement;
        innerText: HTMLElement;
    }
    openRequestTime: number;
    listViewBox: ListViewBox<any>;
    constructor(p) {
        super(p);
        this.cache = {};
        this.handleClick = this.handleClick.bind(this);
        this.handleSelectionChanged = this.handleSelectionChanged.bind(this);
        this.listViewBoxNotFoundCounter = 2;
        this.handleSetValue = this.handleSetValue.bind(this);
    }
    getListViewBox(): ListViewBox<any> {
        const { listViewContainer } = this.refs;

        return this.querySelectorAll('.list-view-data-lookup', listViewContainer)[0] as ListViewBox<any>;

    }
    closePopup(delta?: Partial<DataLookupState>) {
        if (this.openRequestTime && ((+ new Date() - this.openRequestTime) < 200))
            return;
        this.repatch(Object.assign({ isOpen: false, isHidden: false, isActive: false }, delta || {}));

    }
    handleClick(e: React.MouseEvent<any>) {
        let parent = e.target as HTMLElement;
        while (parent) {
            if (parent.classList.contains('list-view-container')) break;
            parent = parent.parentElement;
        }
        if (parent) return;
        e.preventDefault();
        e.stopPropagation();
        this.openRequestTime = +new Date();
        const s = this.state;
        const isOpen = !s.isOpen;
        closeAllPopup(this);
        this.repatch({ isOpen, isHidden: false, isActive: true })
    }
    adjustEditorPadding() {
        const { innerTextSpan, root, editorWrapper, innerText } = this.refs;
        if (!root || !innerTextSpan) return;
        const input = editorWrapper.querySelector('input');

        let width = Math.ceil(innerText.offsetWidth || innerTextSpan.offsetWidth) + 15;
        if (Math.abs(innerTextSpan.offsetWidth - innerText.offsetWidth) > 20)
            width = Math.ceil(innerTextSpan.offsetWidth) + 30;
        input && input.style && (input.style.paddingRight = width + 'px');


    }
    handleSelectionChanged(indices: number[], index) {
        const listViewBox = this.getListViewBox();
        const items: any[] = listViewBox && listViewBox.refs.dataList && listViewBox.refs.dataList.items;
        console.assert(items instanceof Array, 'items is not array @handleSelectionChanged');
        const indiceDic: { [key: number]: boolean } = indices.reduce((accum, idx) => (accum[idx] = true, accum), {});
        const ids = items.filter((_, idx) => indiceDic[idx]).map(row => listViewBox.getId(row));
        const value = this.props.multiple ? ids : ids[0];
        this.repatch({ value });
        if (!this.props.multiple && ids.length)
            closeAllPopup();
        this.props.onChange instanceof Function && this.props.onChange(
            this.props.multiple ? ids : ids[0]
        );


    }
    repatch(delta: Partial<DataLookupState>, target?) {
        if ('isOpen' in delta && !delta.isOpen) {
            this.listViewBox = null;
            if (this.state.isOpen && this.openRequestTime) {
                const { listViewContainer } = this.refs;

                if (listViewContainer) {
                    const rows = Array.from(listViewContainer.querySelectorAll(".ms-DetailsRow")).map(r => Array.from(r.classList));

                }
            }
        }

        super.repatch(delta, target);
    }
    tryToActionsForListViewBox: number;
    listViewBoxNotFoundCounter: number;
    processDOM() {
        const { listViewContainer, textField } = this.refs;
        const s = this.state;
        this.listViewBox = this.getListViewBox();
        this.listViewBoxNotFoundCounter = this.listViewBoxNotFoundCounter || 0;
        if (!this.listViewBox && this.listViewBoxNotFoundCounter >= 0) {
            this.listViewBoxNotFoundCounter--;
            setTimeout(() => this.repatch({}), 10);

        }
        const { actionsForListViewBox } = this;
        this.optionsForListViewBox = this.optionsForListViewBox || (this.listViewBox &&
            Object.assign({}, this.listViewBox.props.options));
        this.actionsForListViewBox = this.actionsForListViewBox || (this.listViewBox &&
            Object.assign({}, this.listViewBox.props.actions, this.listViewBox.props.customActions || {}));
        if (actionsForListViewBox != this.actionsForListViewBox && !this.openRequestTime) this.repatch({ isOpen: false, isHidden: false });
        if (this.props.value && !this.state.isHidden && !this.actionsForListViewBox && !this.tryToActionsForListViewBox) {
            this.tryToActionsForListViewBox = this.tryToActionsForListViewBox || 0;
            this.tryToActionsForListViewBox++;

            setTimeout(() => this.repatch({ isOpen: true, isHidden: true }), 20);
            setTimeout(() => this.listViewElement = null, 100);
        }
        if (s.isActive) {
            textField && textField.focus();
            textField && textField.select();

            //  !textField && setTimeout(() => this.repatch({}), 2);
        }
    }
    componentDidMount() {
        super.componentDidMount();
        this.processDOM();
        this.props.value && this.repatch({ value: this.props.value });

    }
    componentDidUpdate() {
        super.componentDidMount();
        this.processDOM();
    }
    getValue() {
        const result = [this.state.value, this.props.value].filter(v => v !== undefined)[0];
        if (result instanceof Array && result.length == 0) return null;
        return result;
    }
    unshiftIds(...Ids) {

    }
    getInnerText(): JSX.Element[] {
        if (!this.actionsForListViewBox) return this.getValue() && Promise.resolve('wait') as any;
        const value = this.getValue();
        let result = null;

        const valueArray = (value instanceof Array ? (value || []) as any[] : [value]).filter(x => !!x);
        /*    valueArray.forEach(v =>
                this.cache[v] = this.cache[v] || this.actionsForListViewBox.read(v)
                    .then(r => {
                        this.cache[v] = r, this.forceUpdate();
                        return r;
                    }));
            Promise.all(Object.values(this.cache).filter(promise => promise instanceof Promise))
                .then(() => this.unshiftIds(...valueArray))
            const promised = (valueArray.filter(v => this.cache[v] instanceof Promise).map(v => this.cache[v]));
            const innerText = promised[0] || valueArray.map(v => v && this.actionsForListViewBox.getText && this.actionsForListViewBox.getText(this.cache[v]));
    */
        return valueArray.map(value => (<DataLookupCell
            actions={this.actionsForListViewBox as any}
            options={this.optionsForListViewBox as any}
            key={value}
            value={value} />));
    }
    @Event()
    handleSetValue(value) {
        this.repatch({ value });
        this.props.onChange instanceof Function && this.props.onChange(value);

    }
    handleRemoveClick(e: React.MouseEvent<HTMLElement>) {
        e.preventDefault();
        const target = e.target as HTMLElement;
        const idx = target.getAttribute('data-idx');
        const { value } = this.state;
        if (!this.props.multiple) this.handleSetValue(null);
        else if (value instanceof Array) this.handleSetValue((value || []).filter((_, i) => idx != idx));

    }
    render() {
        const p = this.props, s = this.state;

        const innerText = p.onDisplayText instanceof Function ? undefined : this.getInnerText();
        const { listViewContainer } = this.refs;
        if (s.isOpen && !listViewContainer)
            setTimeout(() => this.forceUpdate(), 10);
        const textField = !(innerText instanceof Promise) &&
            <TextField onBlur={p.onBlur as any} onFocus={p.onFocus} itemRef="textField"

            />;
        this.adjustEditorPadding();
        this.listViewElement = this.listViewElement || (listViewContainer && p.source && React.createElement(p.source, {
            forDataLookup: true,
            defaultSelectedValues: () => Utils.toArray([s.value, p.value].filter(v => v !== undefined)[0]),
            getValue: () => [s.value, p.value].filter(v => v !== undefined)[0],
            dataLookup: this,
            multipleDataLookup: p.multiple,
            corner: p.multiple && this.getCorner(),
            height: listViewContainer.clientHeight - 3,
            onSelectionChanged: this.handleSelectionChanged,
            setValue: this.handleSetValue
        } as Partial<OrganicUi.IListViewParams>));
        const maxWidthForTextOverflow = this.refs.root && Math.round(this.refs.root.offsetWidth * 0.8);
        return <div ref="root" className={classNames("closable-element", p.className, "data-lookup", s.isActive ? 'active' : 'deactive')}
            onClick={this.handleClick}>
            {innerText instanceof Promise && <span className="spinner-container"> <Spinner /></span>}
            <div className="editor" ref="editorWrapper">{textField}</div>
            {(p.onDisplayText || maxWidthForTextOverflow) &&
                (p.onDisplayText || innerText instanceof Array) &&
                <div className="inner-text" ref="innerText">
                    <div className="text " >
                        <span ref="innerTextSpan" className="selected-items" style={{ maxWidth: maxWidthForTextOverflow + "px" }}>
                            {p.onDisplayText instanceof Function ? p.onDisplayText(this.getValue()) : innerText.map((title, idx) => (
                                <span className="selected-item">
                                    <span >
                                        {title}
                                    </span>
                                    <a href="#" data-idx={idx} onClick={this.handleRemoveClick} className="remove-btn"><i className="fa fa-times"> </i></a>
                                </span>))}</span></div>

                    {Utils.showIcon(this.props.iconCode, 'activate-focused-only')}
                </div>}
            <span className="caretDownWrapper  ">
                <svg className="MuiSvgIcon-root MuiSelect-icon" focusable="false" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M7 10l5 5 5-5z"></path>
                </svg>
            </span>
            {(s.isOpen) && <div className="list-view-container box " style={{
                display: s.isHidden ? 'none' : 'block',
                minHeight: p.minHeightForPopup
            }} ref="listViewContainer">{this.listViewElement}</div>
            }
        </div>
    }
    getCorner() {
        return <div>
            <ActionButton iconProps={{ iconName: "Accept" }} />
            <ActionButton iconProps={{ iconName: "Cancel" }} />
        </div>
    }


}
interface DataLookupCellProps {
    actions: IActionsForCRUD<any>;
    options: IOptionsForCRUD;
    value: any;

}
class DataLookupCell extends BaseComponent<DataLookupCellProps, any>{
    static cache = {};

    state: {
        result: any;
    }
    getListViewName() {
        return this.props.options.singularName || this.props.options.pluralName;
    }
    static cellsByCacheId: { [key: string]: DataLookupCell[] } = {};
    static cellRefsByCacheId: { [key: string]: Object } = {};
    static repatchAllByCacheId(cacheId, delta) {
        const cells = DataLookupCell.cellsByCacheId[cacheId];
        console.log({ cells });
        if (cells instanceof Array)
            cells.forEach(cell => cell.repatch(delta));
    }
    render() {
        //if (!this.state.result) return <span />
        const p = this.props;

        if (p.value) {
            const cacheId = this.getListViewName() + p.value;
            DataLookupCell.cellRefsByCacheId[cacheId] = DataLookupCell.cellRefsByCacheId[cacheId] || {};
            if (!DataLookupCell.cellRefsByCacheId[cacheId][this.refId]) {
                DataLookupCell.cellsByCacheId[cacheId] = DataLookupCell.cellsByCacheId[cacheId] || [];
                DataLookupCell.cellsByCacheId[cacheId].push(this);
            }
            Object.assign(DataLookupCell.cellRefsByCacheId[cacheId], { [this.refId]: 1 });
            if (this.state.result === undefined)
                this.state.result = DataLookupCell.cache[cacheId] = DataLookupCell.cache[cacheId] || (p.value &&
                    p.actions.read(this.props.value)
                        .then(dto => p.actions.getText(dto))
                        .then(result => DataLookupCell.cache[cacheId] = result)
                        .then(result => DataLookupCell.repatchAllByCacheId(cacheId, { result })));
        }
        return <span className="data-lookup-cell" data-value={JSON.stringify(this.props.value)}
            data-singularName={this.props.options.singularName} >
            {this.state.result instanceof Promise ? <Spinner /> : (this.state.result || '')}</span>;
    }
}

document.body.addEventListener('click', e => {
    const { target } = (e as any) as { target: HTMLElement };
    if (!target) return;
    let parent = target;
    while (parent) {
        if (parent.classList.contains('data-lookup')) break;
        parent = parent.parentElement;
    }
    const componentRef: DataLookup = parent && parent['componentRef'];

    closeAllPopup(componentRef);

})
Object.assign(window, { DataLookup, DataLookupCell });