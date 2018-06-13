import { BaseComponent } from './base-component';
import { templates, icon, i18n } from './shared-vars';
import { Utils } from './utils';
const { classNames } = Utils;

import { isDevelopmentMode } from './developer-features';
import { DetailsList } from 'office-ui-fabric-react';
import { TextField } from '@material-ui/core';
import { ListViewBox } from './list-view-box';
import { Spinner } from './spinner';
interface DataLookupProps {
    source: StatelessListView;
    onChange?: (id) => void;
    onFocus?: () => void;
    multiple?: boolean;
    value?: any;
}
interface DataLookupState {
    isOpen?: boolean;
    isActive?: boolean;
    currentRow: any;
    isHidden?: boolean;
    value?: any;
}
function closeAllPopup(activeDataLookup?) {
    Array.from(document.querySelectorAll('.closable-element'))
        .map(element => element['componentRef'] as DataLookup)
        .forEach(dataLookup => activeDataLookup != dataLookup && dataLookup.closePopup());
}
export class DataLookup extends BaseComponent<DataLookupProps, DataLookupState>{
    listViewElement: React.SFCElement<IListViewParams>;
    actionsForListViewBox: IActionsForCRUD<any>;
    cache: { [key: string]: any };
    refs: {
        listViewContainer: HTMLElement;
        textField: any;
    }
    openRequestTime: number;
    listViewBox: ListViewBox<any>;
    constructor(p) {
        super(p);
        this.cache = {};
        this.handleClick = this.handleClick.bind(this);
        this.handleSelectionChanged = this.handleSelectionChanged.bind(this);
    }
    getListViewBox(): ListViewBox<any> {
        const { listViewContainer } = this.refs;

        return this.listViewBox = this.listViewBox || this.querySelectorAll('.list-view-data-lookup', listViewContainer)[0];;
    }
    closePopup() {
        if (this.openRequestTime && ((+ new Date() - this.openRequestTime) < 200))
            return;
        this.repatch({ isOpen: false, isHidden: false, isActive: false });

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


            closeAllPopup();
            this.repatch({ isOpen: false, isActive: true, value: ids[0] });

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

    processDOM() {
        const { listViewContainer, textField } = this.refs;
        const s = this.state;
        this.listViewBox = this.listViewBox || this.querySelectorAll('.list-view-data-lookup', listViewContainer)[0];
        if (!this.listViewBox) setTimeout(() => this.repatch({}), 100);

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

    }
    componentDidUpdate() {
        super.componentDidMount();
        this.processDOM();
    }
    getValue() {
        const v = this.state.value || this.props.value;
        if (v instanceof Array && v.length == 0) return null;
        return v;
    }
    getInnerText(): any {
        if (!this.actionsForListViewBox) return this.getValue() && Promise.resolve('wait');
        const value = this.getValue();
        let result = null;

        const valueArray = (value instanceof Array ? (value || []) as any[] : [value]).filter(x => !!x);
        valueArray.forEach(v =>
            this.cache[v] = this.cache[v] || this.actionsForListViewBox.handleRead(v)
                .then(r => {
                    this.cache[v] = r, this.forceUpdate();
                    return r;
                }));

        const promised = (valueArray.filter(v => this.cache[v] instanceof Promise).map(v => this.cache[v]));
        const innerText = promised[0] || valueArray.map(v => v && this.actionsForListViewBox.getText(this.cache[v])).join(',');
        console.log({ value, valueArray, innerText });
        return innerText;
    }
    render() {
        const p = this.props, s = this.state;
        if (this.actionsForListViewBox)
            s.currentRow = s.currentRow ||
                (p.value && this.actionsForListViewBox.handleRead(p.value)
                    .then(currentRow => (this.repatch({ currentRow }), currentRow)));
        const innerText = this.getInnerText();
        const { listViewContainer } = this.refs;
        if (s.isOpen && !listViewContainer)
            setTimeout(() => this.forceUpdate(), 10);
        const textField = !(innerText instanceof Promise) && <TextField onFocus={p.onFocus} itemRef="textField"
            value={innerText} />;

        this.listViewElement = this.listViewElement || (listViewContainer && React.createElement(p.source, { forDataLookup: true, multipleDataLookup: p.multiple, corner: p.multiple && this.getCorner(), height: listViewContainer.clientHeight - 10, onSelectionChanged: this.handleSelectionChanged } as Partial<IListViewParams>));
        return <div ref="root" className={classNames("closable-element", "data-lookup", s.isActive ? 'active' : 'deactive')}
            onClick={this.handleClick}>
            {innerText instanceof Promise && <span className="spinner-container"> <Spinner /></span>}
            <div className="editor">
                {textField}

            </div>
            <span className="caretDownWrapper  ">
                 <svg className="MuiSvgIcon-root MuiSelect-icon" focusable="false" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M7 10l5 5 5-5z"></path>
                </svg>
            </span>
            {(s.isOpen) && <div className="list-view-container box " style={{ display: s.isHidden ? 'none' : 'block' }} ref="listViewContainer">

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