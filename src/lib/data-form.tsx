/// <reference path="../organicUI.d.ts" />


import { icon, i18n, DevFriendlyPort, funcAsComponentClass, FuncComponent, BaseComponent, FabricUI } from "../organicUI";
import { Utils } from './utils';


import { Panel } from "./ui-kit";

import { PanelType } from "office-ui-fabric-react";
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import { IFieldProps, Field, IFieldReaderWriter } from "./data";

interface IDataFormProps extends IFieldReaderWriter {
    validate?: boolean;
    customValidation?: CustomValidationResult;
    data?: any;
}
interface IDataListState {
    message?: { type, text };
    selectedItem: any;
    selectedItemIndex: number;
    isOpen?: boolean;
    targetSelector?: string;
    items: any[];
    validated?: boolean;
}
export class DataForm extends BaseComponent<IDataFormProps, IDataListState>{
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
    render() {
        const p = this.props;
        return (
            <div className="data-form" ref="root">
                <DevFriendlyPort target={this} targetText={'DataForm'} >
                    {this.props.children}
                </DevFriendlyPort>
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
    revalidateAllFields() {
        this.invalidItems = [];
        return new Promise(resolve => {
            const done = () => {
                this.invalidItems = this.querySelectorAll<Field>('.field-accessor')
                    .map(fld => fld.revalidate())
                    .filter(x => !!x)
                    .concat(this.props.customValidation instanceof Function ?
                        (this.props.customValidation(this.props.data) || []) : []).filter(x => !!x);

                resolve(this.invalidItems);
                setTimeout(() => this.invalidItems = [], 300);
            }

            const customValidationResult = this.props.customValidation instanceof Function &&
                (this.props.customValidation(this.props.data) || []);
            if (customValidationResult instanceof Promise)
                customValidationResult.then(done)
            else done();
        });

    }

    processFields() {

        this.querySelectorAll<Field>('.field-accessor').forEach(fld => fld.processDOM());

        this.querySelectorAll<IBindableElement>('.bindable').forEach(bindable => bindable.tryToBinding());

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
}
interface IDataPanelState {
    readonly?: boolean;

}
interface DataListPanelProps extends Partial<FabricUI.IDetailsListProps>, Partial<IDataPanelProps> {

    formMode?: 'modal' | 'callout' | 'panel' | 'section';
    avoidAdd?, avoidDelete?, avoidEdit?: boolean;
    accessor?: string;
    customValidation?: CustomValidationResult;
    singularName?, pluralName?: string;
}

export class DataListPanel extends BaseComponent<DataListPanelProps, IDataListState>
    implements IBindableElement {
    targetItem: any;
    items: any[];
    lastMod: number;
    refs: {
        root: HTMLElement;
        dataForm: DataForm;
        dataFormWrapper: HTMLElement;
    }
    static formModes = {
        dialog: FabricUI.Dialog,
        modal: Modal,
        panel: FabricUI.Panel,
        callout: FabricUI.Callout,
        section: 'section'
    }
    tryToBinding() {
        this.items = this.getItems();
        if (this.items)
            this.repatch({});
    }
    getItems() {
        if (this.items) return this.items;
        const { root } = this.refs;
        if (!root) return;
        let parent = root.parentElement;
        let getters: (string | Function)[] = [];
        while (parent) {
            const { componentRef } = parent as any;
            const onFieldRead = componentRef && componentRef.props && (componentRef.props as IFieldReaderWriter).onFieldRead;
            const onFieldWrite = componentRef && componentRef.props && (componentRef.props as IFieldReaderWriter).onFieldWrite;

            if (onFieldRead instanceof Function && onFieldWrite instanceof Function) {

                let items = onFieldRead(this.props.accessor);
                if (!items) {
                    onFieldWrite(this.props.accessor, []);
                    items = onFieldRead(this.props.accessor);
                }

                return items;

            }
            parent = parent.parentElement;
        }
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
        const detailListProps: FabricUI.IDetailsListProps = Object.assign({}, { key: 'datalist' + this.lastMod }, extraPropsOfDetailList, { layoutMode: FabricUI.DetailsListLayoutMode.justified }, p, {});
        detailListProps.columns = detailListProps.columns && detailListProps.columns.map(col => Object.assign({}, col, { name: i18n.get(col.name) }));
        detailListProps.columns = detailListProps.columns ||
            React.Children.map(this.props.children || [], (child: JSX.Element) => child.props && (child.props as IFieldProps).accessor)
                .filter(x => !!x).map(key => ({ key, fieldName: key, name: Field.getLabel(key) })) as FabricUI.IColumn[];

        const callOutTarget = s.targetSelector && this.refs.root.querySelector(s.targetSelector);

        const detailList = React.createElement(FabricUI.DetailsList, detailListProps);
        if (s.targetSelector && s.targetSelector.includes('delete'))
            setTimeout(() => OrganicUI.Utils.makeReadonly(this.refs['dataFormWrapper']), 100);


        const targetClick = (targetSelector: string) => () => {

            if (targetSelector && targetSelector.includes('add')) {
                this.targetItem = {};
                this.repatch({ selectedItem: null });
            }
            this.repatch(s.targetSelector == targetSelector ? { validated: false, isOpen: false, targetSelector: null } : { validated: false, isOpen: true, targetSelector });
        }
        console.log('state>>>', this.state);
        const children = [!p.avoidAdd &&
            <FabricUI.DefaultButton primary className="add-button" onClick={targetClick('.add-button')} iconProps={{ iconName: 'Add' }} text={i18n('add') as any} />,
        !p.avoidEdit &&
        <FabricUI.DefaultButton className="edit-button" disabled={!s.selectedItem} onClick={targetClick('.edit-button')} iconProps={{ iconName: 'Edit' }} text={i18n('edit') as any} />,
        !p.avoidDelete &&
        <FabricUI.DefaultButton className="delete-button" disabled={!s.selectedItem} onClick={targetClick('.delete-button')} iconProps={{ iconName: 'Delete' }} text={i18n('delete') as any} />,
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
                                customValidation: p.customValidation,
                                validate: s.validated
                            }, p.children)}
                    </div>
                    <footer>
                        {!s.selectedItem

                            && <OrganicUI.AdvButton primary
                                onClick={async () => {

                                    const { dataForm } = this.refs;
                                    console.assert(!!dataForm, 'dataForm is null');
                                    await dataForm.revalidateAllFields();
                                    this.repatch({ validated: true });
                                    if (dataForm.invalidItems && dataForm.invalidItems.length) {
                                        this.repatch(
                                            { message: { text: i18n(dataForm.invalidItems[0].message), type: FabricUI.MessageBarType.error } });
                                        setTimeout(() => this.repatch({ message: null }), 3000);
                                        return;
                                    }
                                    this.getItems().push(this.targetItem), this.lastMod = +new Date();
                                    this.repatch(
                                        { isOpen: false, targetSelector: null, message: { text: i18n('add-success'), type: FabricUI.MessageBarType.success } });


                                    this.targetItem = {};

                                }}
                                disabled={!!s.selectedItem} iconProps={{ iconName: 'Add' }} >
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
                                    this.repatch(
                                        { message: { text: i18n('add-success'), type: FabricUI.MessageBarType.success } });

                                }
                                if (s.targetSelector && s.targetSelector.includes('delete') &&
                                    typeof s.selectedItemIndex == 'number') {
                                    this.items.splice(s.selectedItemIndex, 1);
                                }
                                this.repatch({ validated: true, isOpen: false, targetSelector: null });

                            }}
                            primary={!!s.selectedItem}
                            disabled={!s.selectedItem} >{i18n(s.targetSelector.replace('.', '').replace('-button', '')) as any}
                        </OrganicUI.AdvButton>}

                    </footer>
                    {!!this.state.message && <div> <FabricUI.MessageBar messageBarType={this.state.message.type} >{this.state.message.text} </FabricUI.MessageBar>
                    </div>}
                </div>))
            , detailList].filter(x => !!x);
        return <div className=" bindable" ref="root">{header ? React.createElement(DataPanel, Object.assign({}, p, { header }), ...children) : children}</div>;
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


        return <div className={Utils.classNames("data-panel ", p.primary && 'primary-data-panel', s.readonly ? 'readonly' : 'editable')}>

            {React.createElement(Panel, Object.assign({}, p, { header }))}
        </div>;
    }

}
