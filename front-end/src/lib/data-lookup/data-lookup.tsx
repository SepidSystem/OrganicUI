/// <reference path="../../dts/organic-ui.d.ts" />

import { BaseComponent } from '../core/base-component';
import { Utils } from '../core/utils';
const { classNames } = Utils;
import { DataLookupPopOver } from './data-lookup-popover';
import { DataLookupCell } from './data-lookup-cell';
import { ListViewBox } from '../templated-views/list-view-box';
import { Spinner } from '../core/spinner';
import OrganicBox from '../templated-views/organic-box';
import { TextField } from '../controls/inspired-components';
import { DataLookupModal } from './data-lookup-modal';
import { DataList } from '../data/data-list';
import { SelfBind } from '../core/decorators';
import { IActionsForCRUD } from '@organic-ui';


interface IState {
    isOpen?: boolean;
    debug?: boolean;
    isActive?: boolean;
    isHidden?: boolean;
    value?: any | any[];
    refId: number;
    appliedSource: any;
    selectedValueDic: any[];
    batchList: any;
    batchListHash: string;
    textHeight: number;
}
function closeAllPopup(activeDataLookup?) {
    const query = () => Array.from(document.querySelectorAll('.closable-element'))
        .map(element => element['componentRef'] as DataLookup)
        .forEach(dataLookup => activeDataLookup != dataLookup && dataLookup.closePopup({ isActive: false }));
    setTimeout(query, 200);
}

export class DataLookup extends BaseComponent<OrganicUi.DataLookupProps, IState>{

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
        text: HTMLElement
    }
    openRequestTime: number;
    savedScrollTop: number;
    lastTryCalcHeight: number;
    constructor(p: OrganicUi.DataLookupProps) {
        super(p);
        this.cache = {};
        this.listViewBoxNotFoundCounter = 2;
        this.applySource(p.source);
        this.state.selectedValueDic = p.value ? Utils.toArray(p.value).filter(id => id !== undefined && id !== null).reduce((accum, id) => Object.assign(accum, { [id]: true }), {}) : {};
    }

    getListViewBox(): ListViewBox<any> {
        const { refId } = this.state as any;
        const elements = Array.from(document.querySelectorAll('.list-view-data-lookup')).
            filter(dom => dom.getAttribute('data-parent-id') == refId);
        return elements.map(dom => dom['componentRef'])[0];

    }
    getListViewElement(): HTMLElement {
        const { refId } = this.state as any;

        return Array.from(document.querySelectorAll('.list-view-data-lookup')).
            filter(dom => dom.getAttribute('data-parent-id') == refId)[0] as HTMLElement;
    }
    closePopup(delta?: Partial<IState>) {
        if (this.openRequestTime && ((+ new Date() - this.openRequestTime) < 200))
            return;

        this.repatch(Object.assign({ isOpen: false, isHidden: false, isActive: false }, delta || {}));

    }
    @SelfBind()
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
        if (isOpen) {

            const savedScrollTop = this.savedScrollTop = document.documentElement.scrollTop;
            const { overflow } = getComputedStyle(document.body);
            setTimeout(function () {
                document.body.style.overflow = overflow;
                document.documentElement.scrollTop = savedScrollTop;
            }, 100);
            if (!this.props.popupMode.inlineMode && this.state.value)
                this.state.selectedValueDic = this.computeSelectedValueDic(this.state.value)
        }
        this.repatch({ isOpen, isHidden: false, isActive: true })
    }
    adjustEditorPadding() {
        if (this.props.disableAdjustEditorPadding) return;
        const { innerTextSpan, root, editorWrapper, innerText } = this.refs;
        if (!root || !innerTextSpan) return;
        const input = editorWrapper.querySelector('input');

        let width = Math.ceil(innerText.offsetWidth || innerTextSpan.offsetWidth) + 15;
        if (Math.abs(innerTextSpan.offsetWidth - innerText.offsetWidth) > 20)
            width = Math.ceil(innerTextSpan.offsetWidth) + 30;
        input && input.style && (input.style.paddingRight = width + 'px');


    }
    @SelfBind()
    handleSelectionChanged(indices: number[], index) {

        const listViewBox = this.getListViewBox();
        if (listViewBox.state.readingList) return;
        const items: any[] = listViewBox && listViewBox.refs.dataList && listViewBox.refs.dataList.items && listViewBox.refs.dataList.items.filter(x => !!x);
        if (!items) return;
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
        if (this.props.popupMode.inlineMode) {
            const value = this.props.multiple ? Object.keys(selectedValueDic).filter(id => Utils.safeNumber(id)) : ids[0];
            this.repatch({ value });
        }
        if (this.props.popupMode.inlineMode)
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
        return { actions: (source['dataLookupActions'] as IActionsForCRUD<any>), options: source['dataLookupOptions'] };
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
        if (Utils.equals(nextProps.value, this.props.value))
            this.repatch({ value: nextProps.value });

    }
    processDOM() {
        const { listViewContainer, textField } = this.refs;
        const s = this.state;


        if (s.isActive) {
            textField && textField.focus();
            textField && textField.select();

            //  !textField && setTimeout(() => this.repatch({}), 2);
        }
        const textRef = this.refs.text;
        const now = +new Date();
        if (textRef && this.state.textHeight != textRef.clientHeight) {
            if ((now - (this.lastTryCalcHeight || 0) > 500)) {
                this.lastTryCalcHeight = +new Date();
                this.repatch({ textHeight: textRef.clientHeight })
                    .then(
                        () => this.lastTryCalcHeight = +new Date());


            }
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
            //setTimeout(() => this.repatch({}), 300);
            return value; //&& Promise.resolve('wait') as any;
        }

        const valueArray = (value instanceof Array ? (value || []) as any[] : [value]).filter(x => !!x);
        if (this.state.batchListHash != Utils.hash(valueArray)) {
            this.state.batchListHash = Utils.hash(valueArray);
            this.state.batchList = null;
        }
        this.state.batchList = this.state.batchList || this.readBatchList(valueArray).then(batchList => this.repatch({ batchList }));
        const { batchList } = this.state;
        if (batchList instanceof Promise) return [<Spinner />]

        return options && valueArray.map(value => (batchList[value] && <DataLookupCell
            text={batchList[value]}
            actions={null}
            options={options}
            key={options.singularName + value}
            value={value} />)).filter(notFalse => notFalse);
    }
    computeSelectedValueDic(value) {
        return Utils.toArray(value).reduce((accum, id) => Object.assign(accum, { [id]: true }), {});
    }
    @SelfBind()
    handleSetValue(value) {
        if (value instanceof Array && !this.props.multiple) value = value[0];
        const selectedValueDic = this.computeSelectedValueDic(value);
        this.repatch({ value, selectedValueDic, batchList: null });
        this.props && this.props.onChange instanceof Function && this.props.onChange(value);
    }
    setValue(value) {
        this.handleSetValue(value);
    }
    @SelfBind()
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
    getSelectedKeyCollection() {
        return this.state.selectedValueDic;
    }
    @SelfBind()
    handleApply() {
        const listViewElement = this.getListViewElement();
        const dataList = this.querySelectorAll<DataList>('.data-list-wrapper', listViewElement)[0];
        const items: any[] = dataList && dataList.items;
        console.assert(items instanceof Array, 'items is not array @handleSelectionChanged');
        const { getSelectedKeyCollection } = dataList as any;
        const selectedKeyCollection = getSelectedKeyCollection instanceof Function ? getSelectedKeyCollection.apply(dataList) : this.getSelectedKeyCollection();
        if (!selectedKeyCollection) throw 'selectedKeyCollection=null';
        const keys = Object.keys(selectedKeyCollection).filter(id => id !== undefined && id !== null).filter(id => selectedKeyCollection[id]);
        this.handleSetValue(keys)

        this.repatch({ isOpen: false });
    }
    @SelfBind()
    handleAppend() {
        const listViewELement = this.getListViewElement();
        const dataList = this.querySelectorAll<DataList>('.data-list-wrapper', listViewELement)[0];
        const items: any[] = dataList && dataList.items;
        console.assert(items instanceof Array, 'items is not array @handleSelectionChanged');
        const { getSelectedKeyCollection } = dataList as any;

        const selectedKeyCollection = getSelectedKeyCollection instanceof Function ? getSelectedKeyCollection.apply(dataList) : this.getSelectedKeyCollection();
        if (!selectedKeyCollection) throw 'selectedKeyCollection=null';
        const keys = Object.keys(selectedKeyCollection).filter(id => id !== undefined && id !== null).filter(id => selectedKeyCollection[id]);
        this.handleSetValue(keys.concat(this.state.value));
        this.repatch({ isOpen: false });
    }
    repatch(delta: Partial<IState>, target?, delay?) {
        if ('isOpen' in delta && (!!delta.isOpen) != (!!this.state.isOpen)) {
            if (delta.isOpen) this.savedScrollTop = document.documentElement.scrollTop;
            else setTimeout(scrollTop => {
                document.documentElement.scrollTop = scrollTop;
            }, 300, this.savedScrollTop);

        }
        return super.repatch(delta, target, delay);
    }

    static adjustFieldClassName(props, classNameForRoot, className) {
        const excludedClasses = [props.bellowList && 'has-value'].filter(x => !!x);
        function adjustClassName(clsName: string) {
            if (excludedClasses.length == 0) return clsName;
            return clsName.split(' ').filter(item => !excludedClasses.includes(item)).join(' ');
        }
        const result = [adjustClassName(classNameForRoot), adjustClassName(className)];
        return result;

    }
    renderPopOver() {
        const p = this.props, s = this.state;
        const { isOpen } = this.state;
        const { root } = this.refs;

        const listViewElement = p.source && React.createElement(p.source, {
            forDataLookup: true,
            width: root && root.clientWidth,
            parentRefId: this.state.refId,
            defaultSelectedValues: () => Object.keys(this.state.selectedValueDic).length ? this.state.selectedValueDic : this.computeSelectedValueDic(this.state.value),
            getValue: () => [s.value, p.value].filter(v => v !== undefined)[0],
            dataLookup: this,
            multipleDataLookup: p.multiple,
            height: 300,
            onSelectionChanged: this.handleSelectionChanged,
            setValue: this.handleSetValue.bind(this),
            customReadListArguments: p.customReadListArguments,
            dataLookupProps: p,
            customReadList: p.customReadList,
            canSelectItem: p.canSelectItem
        } as Partial<OrganicUi.IListViewParams>);

        const onClose = () => {
            this.repatch({ isOpen: false });

        }
        const target = this.refs.root;
        const popupElement = listViewElement && React.createElement<OrganicUi.IDataLookupPopupModeProps>(p.popupMode, {
            isOpen, onClose, target,
            onAppend: this.handleAppend.bind(this),
            onApply: this.handleApply.bind(this),
            dataLookupProps: p, dataLookup: this,
            reversed: !!p.popOverReversed
        }, listViewElement);
        return <div className="list-view-container" style={{ display: 'none' }} ref="listViewContainer">{popupElement}</div>

    }
    cachedBatchItems: { [key: string]: string };
    getId(row, actions) {
        if (!row) return row;
        if (actions.getId instanceof Function)
            return actions.getId(row);
        return Utils.defaultGetId(row);
    }
    async readBatchList(values: any[]) {
        if (values.length == 0) return {};
        this.cachedBatchItems = this.cachedBatchItems || {};
        const { actions } = this.getSourceAttributes();
        const ids = values.filter(id => !this.cachedBatchItems[id]);
        while (ids.length) {
            const splitIds = ids.splice(0, 1000)
            //const filterModel = [{ values: splitIds, op: 'IN', fieldName: 'Id', fieldType: 'enum' }];
            //const listData = await actions.readList({ fromRowIndex: 0, toRowIndex: 0, filterModel, sortModel: null });
            const listData = await actions.readByIds(splitIds);
            const rows: any[] = listData.rows || listData as any;
            Object.assign(this.cachedBatchItems, ...rows.map(row => ({ [this.getId(row, actions)]: actions.getText(row) })));
        }
        return Object.assign({}, ...values.map(id => ({ [id]: this.cachedBatchItems[id] })));
    }
    renderBelowList(): JSX.Element {
        const { options, actions } = this.getSourceAttributes();
        const value = this.getValue();
        const valueArray = (value instanceof Array ? (value || []) as any[] : [value]).filter(x => x !== undefined).filter(x => x !== null);
        if (this.state.batchListHash != Utils.hash(valueArray)) {
            this.state.batchListHash = Utils.hash(valueArray);
            this.state.batchList = null;
        }
        if (valueArray.length)
            this.state.batchList = this.state.batchList || this.readBatchList(valueArray).then(batchList => this.repatch({ batchList }));
        const { batchList } = this.state;
        if (batchList instanceof Promise) return <div className="below-list"> <Spinner /></div>
        return actions && <div className="below-list"><ul   >
            {options && valueArray.map((value, idx) => (!!batchList[value] && <li><DataLookupCell
                text={batchList[value]}
                actions={null}
                options={options}
                key={options.singularName + value}
                value={value} noRemove={true} />
                <i className="fa fa-minus" data-idx={idx} onClick={this.handleRemoveClick.bind(this)} ></i>
            </li>))}
        </ul></div>
    }
    @SelfBind()
    handleFocus() {
        Utils.simulateClick(document.body);
        this.props.onFocus instanceof Function() && this.props.onFocus.apply(this, arguments);
    }
    clear() {
        this.props.onChange && this.props.onChange(null);
        this.repatch({ value: null, selectedValueDic: null })
    }
    renderContent() {
        if (this.state.value === undefined)
            this.state.value = this.props.value;

        const p = this.props, s = this.state;
        const multiline = p.multiple && !p.bellowList;

        const innerText = p.onDisplayText instanceof Function ? undefined : this.getInnerText();
        console.assert(!p.bellowList || p.multiple, 'conflicted properties >>> bellowList & multiple');
        const { listViewContainer } = this.refs;
        if (s.isOpen && !listViewContainer)
            setTimeout(() => this.forceUpdate(), 10);
        const textField = !(innerText instanceof Promise) &&
            <TextField onBlur={p.onBlur as any}
            onKeyDown={e=>e.preventDefault()}
            className="data-lookup-textfield" multiline={multiline} readOnly style={{
                color: 'transparent'

                , height: Math.max(42, this.state.textHeight - 10),
                maxHeight: this.state.textHeight > 80 ? 80 : 44
            }}
                onFocus={this.handleFocus}

                itemRef="textField" />;
        this.adjustEditorPadding();

        const maxWidthForTextOverflow = this.refs.root && Math.round(this.refs.root.offsetWidth * 0.9);
        console.assert(!p.popupMode.inlineMode || !p.multiple, 'conflicted properties >>> inlineMode & multiple');
        const children: any[] = p.children && React.Children.toArray(p.children);
        const multiple = !!this.props.multiple;
        const { value } = this.state;
        if (value && ((value instanceof Array) != multiple)) {
            console.log('issue(data-lookup)>> multiple >', value instanceof Array, multiple, value);
            //    return this.renderErrorMode(` multiple(data-lookup) and  value conflicted`);
        }
        const multipleStyle = multiline ? {
            maxHeight: 90,
            height: this.state.textHeight
        } : {};

        return <div ref="root"
            className={classNames("closable-element", "input-component", p.className, "data-lookup", s.isActive ? 'active' : 'deactive', this.props.multiple ? 'data-lookup-multiple' : 'data-lookup-single')}
            style={
                {
                    ...multipleStyle,
                    ...p.style
                }}     >
            {innerText instanceof Promise && <span className="spinner-container"> <Spinner /></span>}
            < div className="editor" ref="editorWrapper" > {p.textField || textField}</div >
            {(p.onDisplayText || maxWidthForTextOverflow) &&
                (p.onDisplayText || innerText instanceof Array) &&
                (!p.textField) &&
                <div className="inner-text" ref="innerText" style={{ maxHeight: 70, overflow: 'hidden', overflowY: 'auto', top: s.textHeight > 60 ? 10 : 2 }}>
                    <div className="text " ref="text" >
                        <span ref="innerTextSpan" className="selected-items" style={{
                            flexWrap: multiline ? 'wrap' : null,
                            maxWidth: maxWidthForTextOverflow + "px", display: p.bellowList ? 'none' : null
                        }}>
                            {p.bellowList && (p.onDisplayText instanceof Function ? p.onDisplayText(this.getValue()) :
                                Utils.joinElements(innerText, ' ,')
                            )}
                            {!p.bellowList && (p.onDisplayText instanceof Function ? p.onDisplayText(this.getValue()) : innerText.map((title, idx) => Array.from({ length: 1 }, () => (
                                <span className="selected-item">
                                    <span >
                                        {title}
                                    </span>
                                    <a href="#" data-idx={idx} onClick={this.handleRemoveClick} className="remove-btn"><i className="mi mi-close"> </i></a>
                                </span>))))}</span></div>

                    {Utils.showIcon(this.props.iconCode, 'icon activate-focused-only')}
                </div>}
            <span className="action-buttons">
                {children instanceof Array && children.filter(c => c.type && c.type['isDataLookupButton'])}
            </span>
            {p.popupMode && p.popupMode.renderButtons(p, { onClick: this.handleClick })}
            {this.renderPopOver()}
            {!!p.bellowList && this.renderBelowList()}
        </div >
    }
}
