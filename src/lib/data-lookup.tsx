import { BaseComponent } from './base-component';
import { icon, i18n } from './shared-vars';
import { Utils } from './utils';
const { classNames } = Utils;

import { isDevelopmentEnv } from './developer-features';
import { DetailsList } from 'office-ui-fabric-react';
import { TextField } from '@material-ui/core';
import { ListViewBox } from './list-view-box';
import { Spinner } from './spinner';
import { Event } from './decorators';
 
interface DataLookupProps {
    source:OrganicUi.StatelessListView;
    className?: string;
    onChange?: (value) => void;
    onFocus?: () => void;
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
    value?: any;
}
function closeAllPopup(activeDataLookup?) {
    const query = () => Array.from(document.querySelectorAll('.closable-element'))
        .map(element => element['componentRef'] as DataLookup)
        .forEach(dataLookup => activeDataLookup != dataLookup && dataLookup.closePopup({ isActive: false }));
    setTimeout(query, 300);
}
export class DataLookup extends BaseComponent<DataLookupProps, DataLookupState>{
    static defaultProps = {
        iconCode: 'fa-search',
        minHeightForPopup: '300px'
    }
    listViewElement: React.SFCElement<OrganicUi.IListViewParams>;
    actionsForListViewBox: OrganicUi.IActionsForCRUD<any>;
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
        if (!items) return;
        console.assert(items instanceof Array, 'items is not array @handleSelectionChanged');
        const indiceDic: { [key: number]: boolean } = indices.reduce((accum, idx) => (accum[idx] = true, accum), {});
        const ids = items.filter((_, idx) => indiceDic[idx]).map(row => listViewBox.getId(row));
        if (this.props.multiple) {

            this.repatch({ value: ids });

        }
        else {

            this.repatch({ value: ids[0] });
            if (ids.length) {
                closeAllPopup();

            }

        }

        this.props.onChange instanceof Function && this.props.onChange(
            this.props.multiple ? ids : ids[0]
        );


    }
    repatch(delta: Partial<DataLookupState>, target?) {
        if ('isOpen' in delta && !delta.isOpen && this.state.isOpen && this.openRequestTime) {
            const { listViewContainer } = this.refs;
            if (listViewContainer) {
                const rows = Array.from(listViewContainer.querySelectorAll(".ms-DetailsRow")).map(r => Array.from(r.classList));

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
        this.actionsForListViewBox = this.actionsForListViewBox || (this.listViewBox && this.listViewBox.props.actions);
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
    getInnerText(): any[] {
        if (!this.actionsForListViewBox) return this.getValue() && Promise.resolve('wait') as any;
        const value = this.getValue();
        let result = null;

        const valueArray = (value instanceof Array ? (value || []) as any[] : [value]).filter(x => !!x);
        valueArray.forEach(v =>
            this.cache[v] = this.cache[v] || this.actionsForListViewBox.read(v)
                .then(r => {
                    this.cache[v] = r, this.forceUpdate();
                    return r;
                }));
        Promise.all(Object.values(this.cache).filter(promise => promise instanceof Promise))
            .then(() => this.unshiftIds(...valueArray))
        const promised = (valueArray.filter(v => this.cache[v] instanceof Promise).map(v => this.cache[v]));
        const innerText = promised[0] || valueArray.map(v => v && this.actionsForListViewBox.getText && this.actionsForListViewBox.getText(this.cache[v]));

        return innerText;
    }
    @Event()
    handleSetValue(value) {
        this.repatch({ value });
        this.props.onChange instanceof Function && this.props.onChange(value);

    }
    render() {
        const p = this.props, s = this.state;

        const innerText = p.onDisplayText instanceof Function ? undefined : this.getInnerText();
        const { listViewContainer } = this.refs;
        if (s.isOpen && !listViewContainer)
            setTimeout(() => this.forceUpdate(), 10);
        const textField = !(innerText instanceof Promise) &&
            <TextField onFocus={p.onFocus} itemRef="textField"

            />;
        this.adjustEditorPadding();
        this.listViewElement = this.listViewElement || (listViewContainer && React.createElement(p.source, {
            forDataLookup: true,
            defaultSelectedValues: () => Utils.toArray([s.value, p.value].filter(v => v !== undefined)[0]),
            getValue: () => [s.value, p.value].filter(v => v !== undefined)[0],
            dataLookup: this,
            multipleDataLookup: p.multiple,
            corner: p.multiple && this.getCorner(),
            height: listViewContainer.clientHeight - 3,
            onSelectionChanged: this.handleSelectionChanged,
            setValue: this.handleSetValue.bind(this)
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
                            {p.onDisplayText instanceof Function ? p.onDisplayText(this.getValue()) : innerText.map(title => (
                                <span title={title} className="selected-item">
                                    <span >
                                        {title}
                                    </span>
                                    <a href="#" className="remove-btn"><i className="fa fa-times"> </i></a>
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
            }} ref="listViewContainer">

                {this.listViewElement}
            </div>
            }
        </div>
    }
    getCorner() {
        return <div>
            <FabricUI.ActionButton iconProps={{ iconName: "Accept" }} />
            <FabricUI.ActionButton iconProps={{ iconName: "Cancel" }} />
        </div>
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