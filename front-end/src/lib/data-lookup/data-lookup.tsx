/// <reference path="../../dts/organic-ui.d.ts" />

import { BaseComponent } from '../core/base-component';
import { icon, i18n } from '../core/shared-vars';
import { Utils } from '../core/utils';
const { classNames } = Utils;
import { DataLookupPopOver } from './data-lookup-popover';
import { DataLookupCell } from './data-lookup-cell';
import { ListViewBox } from '../box/list-view-box';
import { Spinner } from '../core/spinner';
import { IOptionsForCRUD, IActionsForCRUD } from '@organic-ui';
import OrganicBox from '../box/organic-box';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import { TextField } from '../controls/inspired-components';
import { DataLookupModal } from './data-lookup-modal';


interface DataLookupState {
    isOpen?: boolean;
    debug?: boolean;
    isActive?: boolean;
    isHidden?: boolean;
    value?: any | any[];
    refId: number;
    appliedSource: any;
    selectedValueDic: any[];
}
function closeAllPopup(activeDataLookup?) {
    const query = () => Array.from(document.querySelectorAll('.closable-element'))
        .map(element => element['componentRef'] as DataLookup)
        .forEach(dataLookup => activeDataLookup != dataLookup && dataLookup.closePopup({ isActive: false }));
    setTimeout(query, 200);
}
export class DataLookup extends BaseComponent<OrganicUi.DataLookupProps, DataLookupState>{

    static Popover = DataLookupPopOver;
    static Modal = DataLookupModal;
    static defaultProps: Partial<OrganicUi.DataLookupProps> = {
        minHeightForPopup: '300px',
        popupMode: (DataLookup.Popover as any),

    }
    static classNameForField = (p: OrganicUi.DataLookupProps) => `data-lookup-field control-field-single-line ${!!p.bellowList ? 'has-bellow-list' : ''}`;
    static textReader = (fld, prop: OrganicUi.DataLookupProps, value) => {
        const { source } = prop as any;
        if (!source.dataLookupActions) DataLookup.applySource(source);
        return <DataLookupCell actions={source.dataLookupActions} options={source.dataLookupOptions} value={value} />
    }
    listViewElement: React.ReactElement<OrganicUi.IListViewParams>;

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
    savedScrollTop: number;
    constructor(p: OrganicUi.DataLookupProps) {
        super(p);
        this.cache = {};
        this.handleClick = this.handleClick.bind(this);
        this.handleSelectionChanged = this.handleSelectionChanged.bind(this);
        this.listViewBoxNotFoundCounter = 2;
        this.handleSetValue = this.handleSetValue.bind(this);
        this.applySource(p.source);
        this.state.selectedValueDic = p.value ? Utils.toArray(p.value).filter(id => id !== undefined && id !== null).reduce((accum, id) => Object.assign(accum, { [id]: true }), {}) : {};
    }
    getListViewBox(): ListViewBox<any> {
        const { refId } = this.state as any;
        const elements = Array.from(document.querySelectorAll('.list-view-data-lookup')).
            filter(dom => dom.getAttribute('data-parent-id') == refId);
        return elements.map(dom => dom['componentRef'])[0];

    }
    closePopup(delta?: Partial<DataLookupState>) {
        if (this.openRequestTime && ((+ new Date() - this.openRequestTime) < 200))
            return;

        this.repatch(Object.assign({ isOpen: false, isHidden: false, isActive: false }, delta || {}));

    }
    handleClick(e: React.MouseEvent<any>) {
        let parent = e.target as HTMLElement;
        while (parent) {
            if (parent.classList.contains('list-view-data-lookup')) break;
            parent = parent.parentElement;
        }
        if (parent) return;

        parent = e.target as HTMLElement;
        while (parent) {
            if (parent == this.refs.root) break;
            parent = parent.parentElement;
        }
        if (!parent) {
            return;
        }
        e.preventDefault();
        e.stopPropagation();
        this.openRequestTime = +new Date();
        const s = this.state;

        const isOpen = !s.isOpen;
        closeAllPopup(this);
        if (s.isOpen) {
            this.savedScrollTop = document.documentElement.scrollTop;
            document.documentElement.classList.add('overflowY-hidden');
        }
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
        if (listViewBox.state.readingList) return;
        const items: any[] = listViewBox && listViewBox.refs.dataList && listViewBox.refs.dataList.items;
        console.assert(items instanceof Array, 'items is not array @handleSelectionChanged');
        const indiceDic: { [key: number]: boolean } = indices.reduce((accum, idx) => (Object.assign(accum, { [idx]: true })), {});
        let { selectedValueDic } = this.state;
        const ids = items.filter((_, idx) => indiceDic[idx]).map(row => listViewBox.getId(row));
        if (!this.props.multiple) selectedValueDic = ids.length ? { [ids[0]]: true } as any : {};

        else if (selectedValueDic)
            items.map(item => listViewBox.getId(item)).filter(id => id !== undefined && id !== null)
                .filter(id => (!!selectedValueDic[id]) !== ids.includes(id)).forEach(id => {
                    if (ids.includes(id))
                        selectedValueDic[id] = true;
                    else
                        delete selectedValueDic[id];
                });
        this.state.selectedValueDic = selectedValueDic;
        const value = this.props.multiple ? Object.keys(selectedValueDic).filter(id => Utils.safeNumber(id)) : ids[0];
        this.repatch({ value });
        if (!this.props.multiple && ids.length)
            closeAllPopup();
        this.props.onChange instanceof Function && this.props.onChange(
            this.props.multiple ? ids : ids[0]
        );


    }

    tryToActionsForListViewBox: number;
    listViewBoxNotFoundCounter: number;
    componentWillUnmount() {
        if (this.state.isOpen)
            document.documentElement.classList.remove('overflowY-hidden');
    }
    getSourceAttributes() {
        const { source } = this.props;
        if (!source) return {};
        return { actions: source['dataLookupActions'], options: source['dataLookupOptions'] };
    }
    static applySource(source) {
        if (!source) return;
        if (!source.dataLookupActions || !source.dataLookupOptions) {
            const box = OrganicBox.extractOrganicBoxFromComponent<ListViewBox<any>>(source);
            box && Object.assign(source, {
                dataLookupActions: Object.assign({}, box.props.actions, box.props.customActions || {}),
                dataLookupOptions: box.props.options
            });
        }
        return source;

    }
    applySource(source) {
        this.state.appliedSource = DataLookup.applySource(source);
    }
    componentWillReceiveProps(nextProps: OrganicUi.DataLookupProps) {
        if (nextProps.source != this.props.source)
            this.applySource(nextProps.source);

    }
    processDOM() {
        const { listViewContainer, textField } = this.refs;
        const s = this.state;


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
        const value = this.getValue();
        const { actions, options } = this.getSourceAttributes();
        if (!actions && value) {
            setTimeout(() => this.repatch({}), 300);
            return value && Promise.resolve('wait') as any;
        }

        const valueArray = (value instanceof Array ? (value || []) as any[] : [value]).filter(x => !!x);

        return options && valueArray.map(value => (<DataLookupCell
            actions={actions}
            options={options}
            key={options.singularName + value}
            value={value} />));
    }
    handleSetValue(value) {
        const selectedValueDic = Utils.toArray(value).reduce((accum, id) => Object.assign(accum, { [id]: true }), {});
        this.repatch({ value, selectedValueDic });

        this.props && this.props.onChange instanceof Function && this.props.onChange(value);

    }
    handleRemoveClick(e: React.MouseEvent<HTMLElement>) {
        e.preventDefault();
        e.stopPropagation();
        let target = e.target as HTMLElement;
        let idx = undefined;
        while (target) {
            idx = target.getAttribute('data-idx');
            if (idx) break;
            target = target.parentElement;
        }
        const { value } = this.state;
        if (!this.props.multiple) this.handleSetValue(null);
        else if (value instanceof Array) this.handleSetValue((value || []).filter((_, i) => i != idx));

    }
    handleApply() {
        const listViewBox = this.getListViewBox();
        const items: any[] = listViewBox && listViewBox.refs.dataList && listViewBox.refs.dataList.items;
        console.assert(items instanceof Array, 'items is not array @handleSelectionChanged');
        const { selectedValueDic } = this.state;
        if (!selectedValueDic) throw 'selectedValueDic=null';
        const ids = Object.keys(selectedValueDic).filter(id => id !== undefined && id !== null).filter(id => selectedValueDic[id]);

        this.handleSetValue(ids)
        this.repatch({ isOpen: false });
    }
    handleAppend() {
        const listViewBox = this.getListViewBox();
        const indices = listViewBox.selection.getSelectedIndices();
        const items: any[] = listViewBox && listViewBox.refs.dataList && listViewBox.refs.dataList.items;
        console.assert(items instanceof Array, 'items is not array @handleSelectionChanged');
        const indiceDic: { [key: number]: boolean } = indices.reduce((accum, idx) => (Object.assign(accum, { [idx]: true })), {});
        const ids = items.filter((_, idx) => indiceDic[idx]).map(row => listViewBox.getId(row));
        this.handleSetValue(ids.concat(this.state.value));
        this.repatch({ isOpen: false });
    }
    repatch(delta) {
        if ('isOpen' in delta && (!!delta.isOpen) != (!!this.state.isOpen)) {
            if (delta.isOpen) this.savedScrollTop = document.documentElement.scrollTop;
            else setTimeout(scrollTop => {
                document.documentElement.scrollTop = scrollTop;
            }, 300, this.savedScrollTop);

        }
        super.repatch(delta);
    }
    renderPopOver() {
        const p = this.props, s = this.state;
        const { isOpen } = this.state;
        const { root } = this.refs;
        const listViewElement = p.source && React.createElement(p.source, {
            forDataLookup: true,
            width: root && root.clientWidth,
            parentRefId: this.state.refId,
            defaultSelectedValues: () => this.state.selectedValueDic,
            getValue: () => [s.value, p.value].filter(v => v !== undefined)[0],
            dataLookup: this,
            multipleDataLookup: p.multiple,
            height: 300,
            onSelectionChanged: this.handleSelectionChanged,
            setValue: this.handleSetValue.bind(this)
        } as Partial<OrganicUi.IListViewParams>);

        const onClose = () => {
            this.repatch({ isOpen: false });

        }
        const target = this.refs.root;
        const popupElement = listViewElement && React.createElement<OrganicUi.IDataLookupPopupModeProps>(p.popupMode, {
            isOpen, onClose, target,
            onAppend: this.handleAppend.bind(this),
            onApply: this.handleApply.bind(this),
            dataLookupProps: this.props
        }, listViewElement);
        return <div className="list-view-container" ref="listViewContainer">{popupElement}</div>

    }
    renderBelowList(): JSX.Element {
        const { options, actions } = this.getSourceAttributes();
        const value = this.getValue();
        const valueArray = (value instanceof Array ? (value || []) as any[] : [value]).filter(x => x !== undefined).filter(x => x !== null);
        return actions && <div className="below-list"><ul   >
            {options && valueArray.map((value, idx) => (<li><DataLookupCell
                actions={actions}
                options={options}
                key={options.singularName + value}
                value={value} noRemove={true} />
                <i className="fa fa-minus" data-idx={idx} onClick={this.handleRemoveClick.bind(this)} ></i>
            </li>))}
        </ul></div>
    }

    render() {
        if (this.state.value === undefined)
            this.state.value = this.props.value;
        const p = this.props, s = this.state;
        const innerText = p.onDisplayText instanceof Function ? undefined : this.getInnerText();
        console.assert(!p.bellowList || p.multiple, 'conflicted properties >>> bellowList & multiple');
        const { listViewContainer } = this.refs;
        if (s.isOpen && !listViewContainer)
            setTimeout(() => this.forceUpdate(), 10);
        const textField = !(innerText instanceof Promise) &&
            <TextField onBlur={p.onBlur as any} onFocus={p.onFocus} itemRef="textField" />;
        this.adjustEditorPadding();

        const maxWidthForTextOverflow = this.refs.root && Math.round(this.refs.root.offsetWidth * 0.8);
        console.assert(!p.popupMode.inlineMode || !p.multiple, 'conflicted properties >>> inlineMode & multiple');
        return <div ref="root" className={classNames("closable-element", p.className, "data-lookup", s.isActive ? 'active' : 'deactive')}
        >
            {innerText instanceof Promise && <span className="spinner-container"> <Spinner /></span>}
            <div onClick={!!p.popupMode.inlineMode && this.handleClick} className="editor" ref="editorWrapper">{textField}</div>
            {(p.onDisplayText || maxWidthForTextOverflow) &&
                (p.onDisplayText || innerText instanceof Array) &&
                <div className="inner-text" ref="innerText">
                    <div className="text " >
                        <span ref="innerTextSpan" className="selected-items" style={{ maxWidth: maxWidthForTextOverflow + "px" }}>
                            {p.bellowList && (p.onDisplayText instanceof Function ? p.onDisplayText(this.getValue()) :
                                Utils.joinElements(innerText, ' ,')
                            )}
                            {!p.bellowList && (p.onDisplayText instanceof Function ? p.onDisplayText(this.getValue()) : innerText.map((title, idx) => (
                                <span className="selected-item">
                                    <span >
                                        {title}
                                    </span>
                                    <a href="#" data-idx={idx} onClick={this.handleRemoveClick.bind(this)} className="remove-btn"><i className="fa fa-times"> </i></a>
                                </span>)))}</span></div>

                    {Utils.showIcon(this.props.iconCode, 'icon activate-focused-only')}
                </div>}
            {p.popupMode && p.popupMode.renderButtons(p, { onClick: this.handleClick })}
            {this.renderPopOver()}
            {!!p.bellowList && this.renderBelowList()}
        </div>
    }
}
