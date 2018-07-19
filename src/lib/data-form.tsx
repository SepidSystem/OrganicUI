/// <reference path="../dts/organic-ui.d.ts" />


import { icon, i18n, BaseComponent, FabricUI } from "../organicUI";
import { Utils, changeCase } from './utils';


import { Panel } from "./ui-kit";

import { PanelType, IColumn } from "office-ui-fabric-react";
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import { Field } from "./data";
import { IFieldProps } from "@organic-ui";
import { DataList } from "./data-list";

interface IDataListState {
    message?: { type, text };
    selectedItem: any;
    selectedItemIndex: number;
    isOpen?: boolean;
    targetSelector?: string;
    items: any[];
    validated?: boolean;

}
export class DataForm extends BaseComponent<OrganicUi.IDataFormProps, IDataListState> implements OrganicUi.IDeveloperFeatures {
    devPortId: number;
    getDevButton() {
        return Utils.renderDevButton('DataForm', this as any);
    }
    setFocusByAcccesor(accessor) {

        this.querySelectorAll<Field>('.field-accessor').filter(fld => fld.props.accessor == accessor).forEach(fld => {
            fld.refs.root.classList.add('field-targeted');
            Utils.scrollTo(document.body, fld.refs.root.clientTop, 100);
            fld.refs.root.querySelector('input').focus();
            setTimeout(() => fld.refs.root.classList.remove('field-targeted'), 1500);
        })
    }
    getErrorCard(): React.ReactNode {
        return this.invalidItems && !!this.invalidItems.length && (<div className="error-card"   >
            <div className="title is-5 animated fadeIn">
                <FabricUI.Icon iconName="StatusErrorFull" />{'  '}
                {i18n('error')}</div>
            <div className="animated fadeInDown">
                {i18n('description-rejected-validation')}
                <ul className="invalid-items">
                    {this.invalidItems
                        .filter(invalidItem => !!invalidItem)
                        .map(invalidItem => (<li className="invalid-item">
                            <a href="#" onClick={e => {
                                e.preventDefault();
                                this.setFocusByAcccesor(invalidItem.accessor);
                            }}>

                                {i18n(invalidItem.message)}
                            </a>
                        </li>
                        ))}
                </ul>
            </div>
        </div>);
    }
    static DataFormCount = 0;
    invalidItems: any[];
    appliedFieldName: string;
    refs: {
        root: HTMLElement;
    }
    constructor(p) {
        super(p);
        this.appliedFieldName = `data-form-applied${DataForm.DataFormCount}`;
        this.devPortId = Utils.accquireDevPortId();
        DataForm.DataFormCount++;
    }
    getErrors() {
        const { root } = this.refs;
        console.assert(!!root, 'root is null@getErrors');
        return this.querySelectorAll<Field>('*')
            .filter(componentRef => !!componentRef && componentRef.props && componentRef.props.accessor && componentRef.getErrorMessage instanceof Function)
            .map(componentRef => ({ accessor: componentRef.props.accessor, error: componentRef.getErrorMessage() }))
            .filter(item => !!item.error);

    }

    renderContent() {
        const p = this.props;
        return (
            <div className={Utils.classNames("data-form", "developer-features", p.className)} ref="root">
                {this.props.children}
            </div>
        );
    }
    processField(fld: HTMLElement) {
        if (fld.classList.contains(this.appliedFieldName)) return;
        fld.classList.add(this.appliedFieldName);
        let parent = fld;
        while (parent) {
            if (parent.classList.contains('data-form')) {
                if (this.refs.root == parent) break;
                return;
            }
            parent = parent.parentElement;
        }


    }
    revalidateAllFields(formData?) {
        this.invalidItems = [];
        return new Promise(resolve => {
            const done = () => {

                const customInvalidItems = this.props.onErrorCode instanceof Function ?
                    (this.props.onErrorCode(this.props.data) || []) : [];
                this.invalidItems = this.querySelectorAll<Field>('.field-accessor')
                    .map(fld => fld.revalidate({ customInvalidItems }))
                    .filter(x => !!x)
                    .concat(customInvalidItems).filter(x => !!x);
                resolve(this.invalidItems);
                setTimeout(() => this.invalidItems = [], 300);
            }

            const onErrorCodeResult = this.props.onErrorCode instanceof Function &&
                (this.props.onErrorCode(formData || this.props.data) || []);
            if (onErrorCodeResult instanceof Promise)
                onErrorCodeResult.then(done)
            else done();
        });

    }

    processFields() {
        if (this.devElement) return;
        this.querySelectorAll<Field>('.field-accessor').forEach(fld => fld.processDOM());

        this.querySelectorAll<OrganicUi.IBindableElement>('.bindable').forEach(bindable => bindable.tryToBinding());

    }
    componentDidMount() {
        super.componentDidMount();
        this.processFields()
    }
    componentDidUpdate() {
        this.processFields();
    }
}
interface IDataPanelProps {
    header: any;
    primary?: boolean;
    editable?: boolean;
    className?: string;
}
interface IDataPanelState {
    readonly?: boolean;

}

export class DataListPanel extends BaseComponent<OrganicUi.DataListPanelProps, IDataListState>
    implements OrganicUi.IBindableElement {
    targetItem: any;
    items: any[];
    lastMod: number;

    refs: {
        root: HTMLElement;
        dataForm: DataForm;
        dataFormWrapper: HTMLElement;
        datalist: DataList;
    }
    static formModes = {
        dialog: FabricUI.Dialog,
        modal: Modal,
        panel: FabricUI.Panel,
        callout: FabricUI.Callout,
        section: 'section'
    }
    dataList: any;
    dataListProps: OrganicUi.IDataListProps;
    tryToBinding() {
        this.items = this.getItems();
        if (this.items)
            this.repatch({});
    }
    componentDidMount() {
        super.componentDidMount && super.componentDidMount();
        setTimeout(
            () => this.refs.datalist && this.refs.datalist.reload(), 400);
    }
    getItems() {
        if (this.items) return this.items;
        const { root } = this.refs;
        if (!root) return;
        let parent = root.parentElement;
        let getters: (string | Function)[] = [];
        while (parent) {
            const { componentRef } = parent as any;
            const onFieldRead = componentRef && componentRef.props && (componentRef.props as OrganicUi.IFieldReaderWriter).onFieldRead;
            const onFieldWrite = componentRef && componentRef.props && (componentRef.props as OrganicUi.IFieldReaderWriter).onFieldWrite;

            if (onFieldRead instanceof Function && onFieldWrite instanceof Function) {

                let items = onFieldRead(this.props.accessor);
                if (!items) {
                    onFieldWrite(this.props.accessor, []);
                    items = onFieldRead(this.props.accessor);
                }
                this.items = items;
                return items;

            }
            parent = parent.parentElement;
        }
    }
    getCustomBar(customBar = this.props.customBar) {
        return Utils.renderButtons(customBar, {
            callback: (promise: Promise<any>) => {
                if (promise instanceof Promise)
                    promise.then(value => {
                        const items = this.getItems() || [];
                        items.push(value);
                        this.forceUpdate();
                    });
            }
        })
    }

    render(p = this.props, s = this.state) {
        const header =
            p.header === undefined ? (p.pluralName && Utils.i18nFormat('header-for-data-list-panel', p.pluralName)) : p.header;
        this.targetItem = this.targetItem || {};
        this.lastMod = this.lastMod || +new Date();
        const items = this.getItems();
        const extraPropsOfDetailList: Partial<FabricUI.IDetailsListProps> = {
            items,

            onActiveItemChanged: (selectedItem, selectedItemIndex) => {
                this.targetItem = JSON.parse(JSON.stringify(selectedItem));
                this.repatch({ selectedItem, selectedItemIndex })
            }

        };
        if (!items) {
            setTimeout(() => this.tryToBinding(), 20);
        }

        this.dataListProps = this.dataListProps || Object.assign({} as OrganicUi.IDataListProps,
            {
                ref: 'datalist',
                loader: () => {
                    if (window['loaderDebug']) debugger;
                    return Promise.resolve(this.items);
                }, height: p.dataListHeight,
                paginationMode: 'scrolled'
            },

            { key: 'datalist' + this.lastMod },
            extraPropsOfDetailList,
            { layoutMode: FabricUI.DetailsListLayoutMode.justified }, p, {});
        /*detailListProps.columns = detailListProps.columns &&
            detailListProps.columns.map(col => Object.assign({}, col, { name: i18n.get(col.name) } as Partial<IColumn>));
        detailListProps.columns = detailListProps.columns ||
            React.Children.map(this.props.children || [], (child: JSX.Element) => child.props && (child.props as IFieldProps).accessor)
                .filter(x => !!x).map(key => ({ minWidth: 100, key, fieldName: key, name: Field.getLabel(key) } as FabricUI.IColumn)) as FabricUI.IColumn[];
*/
        const callOutTarget = s.targetSelector && this.refs.root.querySelector(s.targetSelector);

        this.dataList = this.dataList || React.createElement(DataList as any, this.dataListProps, p.children);
        if (s.targetSelector && s.targetSelector.includes('delete'))
            setTimeout(() => OrganicUI.Utils.makeReadonly(this.refs['dataFormWrapper']), 100);


        const targetClick = (targetSelector: string) => () => {

            if (targetSelector && targetSelector.includes('add')) {
                this.targetItem = {};
                //    this.repatch({ selectedItem: null });
            }

            this.repatch(s.targetSelector == targetSelector ? { validated: false, isOpen: false, targetSelector: null, message: null } : { message: null, validated: false, isOpen: true, targetSelector });
        }

        const children = [p.customBar && this.getCustomBar(), !p.customBar && !p.avoidAdd &&
            <FabricUI.DefaultButton primary className="add-button" onClick={targetClick('.add-button')} iconProps={{ iconName: 'Add' }} text={i18n('add') as any} />,
        !p.customBar && !p.avoidEdit &&
        <FabricUI.DefaultButton className="edit-button" disabled={!s.selectedItem} onClick={targetClick('.edit-button')} iconProps={{ iconName: 'Edit' }} text={i18n('edit') as any} />,
        !p.customBar && !p.avoidDelete &&
        <FabricUI.DefaultButton className="delete-button" disabled={!s.selectedItem} onClick={targetClick('.delete-button')} iconProps={{ iconName: 'Delete' }} text={i18n('delete') as any} />,
        this.dataList && <div className="dataList-wrapper" >{this.dataList} </div>,
        !!p.children && s.isOpen &&
        React.createElement((DataListPanel.formModes[p.formMode] || FabricUI.Callout) as any, {
            className: "data-list-panel-fields",
            ref: "panel",
            isOpen: s.isOpen, dialogDefaultMinWidth: '400px', dialogDefaultMaxWidth: '500px',
            type: PanelType.large,
            hasCloseButton: false,
            onDismiss: () => this.repatch({ isOpen: false, targetSelector: null }),
            target: callOutTarget
        } as any, (
                <div style={{ padding: '10px 20px' }}>
                    <div className="columns">
                        <div className="column   is-11 ms-font-xl" style={{ display: 'flex', alignItems: 'center' }}>
                            {Utils.i18nFormat(s.targetSelector.concat('-header-fmt').replace('.', '').replace('-button', ''), p.singularName)}
                        </div>
                        <div className="column" style={{ 'flex': 1, fontSize: '15pt' }} dir="ltr" >
                            <a href="#" className="close" onClick={e => {
                                e.preventDefault();
                                this.repatch({ isOpen: false, targetSelector: null });
                            }}> <i className="fa fa-times"></i></a>
                        </div>

                    </div>
                    <div ref="dataFormWrapper">
                        {React.createElement(DataForm,
                            {
                                ref: "dataForm",
                                onFieldRead: fieldName => this.targetItem[fieldName],
                                onFieldWrite: (fieldName, value) => this.targetItem[fieldName] = value,
                                onErrorCode: p.onErrorCode,
                                validate: s.validated
                            }, p.children)}
                    </div>
                    <footer>
                        {!s.selectedItem

                            && <OrganicUI.AdvButton primary
                                onClick={() => {

                                    const { dataForm } = this.refs;
                                    console.assert(!!dataForm, 'dataForm is null');
                                    dataForm.revalidateAllFields().then(() => {
                                        this.repatch({ validated: true });
                                        if (dataForm.invalidItems && dataForm.invalidItems.length) {
                                            Promise.all(dataForm.invalidItems)
                                                .then(invalidItems => {
                                                    invalidItems = invalidItems.filter(x => !!x);
                                                    this.repatch(
                                                        {
                                                            message: {
                                                                text: i18n(invalidItems[0].message),
                                                                type: FabricUI.MessageBarType.error
                                                            }
                                                        });
                                                    setTimeout(() => this.repatch({ message: null }), 3000);
                                                });
                                            return;
                                        }
                                        this.items = this.getItems();
                                        this.items.push(this.targetItem);
                                        this.lastMod = +new Date();
                                        this.refs.datalist.reload();
                                        this.repatch(
                                            { isOpen: false, targetSelector: null, message: { text: i18n('add-success'), type: FabricUI.MessageBarType.success } });


                                        this.targetItem = {};

                                    });
                                }}
                                disabled={!!s.selectedItem}  >
                                {i18n('add')}</OrganicUI.AdvButton>}
                        {!!s.selectedItem && s.targetSelector && <OrganicUI.AdvButton
                            className={s.targetSelector.replace('.', '')}
                            onClick={async () => {
                                const { dataForm } = this.refs;
                                console.assert(!!dataForm, 'dataForm is null');
                                if (s.targetSelector && s.targetSelector.includes('edit') &&
                                    typeof s.selectedItemIndex == 'number') {
                                    this.repatch({ validated: true });
                                    await dataForm.revalidateAllFields();
                                    if (dataForm.invalidItems && dataForm.invalidItems.length) {
                                        this.repatch(
                                            { message: { text: i18n(dataForm.invalidItems[0].message), type: FabricUI.MessageBarType.error } });
                                        setTimeout(() => this.repatch({ message: null }), 3000);
                                        return;
                                    }
                                    this.items[s.selectedItemIndex] = JSON.parse(JSON.stringify(this.targetItem));
                                    // this.repatch(
                                    //   { message: { text: i18n('add-success'), type: FabricUI.MessageBarType.success } });

                                }
                                if (s.targetSelector && s.targetSelector.includes('delete') &&
                                    typeof s.selectedItemIndex == 'number') {
                                    this.items.splice(s.selectedItemIndex, 1);
                                }
                                this.repatch({ validated: true, isOpen: false, targetSelector: null, message: null });

                            }}
                            primary={!!s.selectedItem}
                            disabled={!s.selectedItem} >{i18n(s.targetSelector.replace('.', '').replace('-button', '')) as any}
                        </OrganicUI.AdvButton>}

                    </footer>
                    {!!this.state.message && <div> <FabricUI.MessageBar messageBarType={this.state.message.type} >{this.state.message.text} </FabricUI.MessageBar>
                    </div>}
                </div>))
        ].filter(x => !!x);

        return <div className={Utils.classNames("data-list-panel-wrapper bindable", p.className)} ref="root" style={p.style}>{header ? React.createElement(DataPanel, Object.assign({}, p, { header }), ...children) : children}</div>;
    }
}
export class DataPanel extends BaseComponent<IDataPanelProps, IDataPanelState>{
    root: HTMLElement;

    componentDidMount() {
        const p = this.props;
        Object.assign(this.state, { editable: p.editable === undefined ? (!p.primary) : p.editable });

    }
    handledActions = {
        edit: () => {
            OrganicUI.Utils.makeWritable(this.root);
            this.repatch({ readonly: false });
        },
        'done-edit': () => {
            OrganicUI.Utils.makeReadonly(this.root);
            this.repatch({ readonly: true });
        }
    }
    render(p: IDataPanelProps = this.props) {
        const s: IDataPanelState = this.state;
        const header = [i18n(p.header),
        <span key="lock-toggle" style={{ "visibility": s.readonly ? 'visible' : 'hidden' }}>
            {icon('lock')}</span>];


        return <div className={Utils.classNames("data-panel ", p.className, p.primary && 'primary-data-panel', s.readonly ? 'readonly' : 'editable')}>

            {React.createElement(Panel, Object.assign({}, p, { header }))}
        </div>;
    }
    defaultProps = {
        dataListHeight: 200
    }
}


export class TupleFields {

}