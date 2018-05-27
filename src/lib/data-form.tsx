/// <reference path="../organicUI.d.ts" />


import { icon, i18n, DevFriendlyPort, funcAsComponentClass, FuncComponent, BaseComponent, FabricUI } from "../organicUI";
import { Utils } from './utils';


import { Panel } from "./ui-kit";

import { PanelType } from "office-ui-fabric-react";
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import { IFieldProps, Field, IFieldReaderWriter } from "./data";

interface IDataFormProps extends IFieldReaderWriter {

    data?: any;
}
interface IDataListState {
    selectedItem: any;
    selectedItemIndex: number;
    isOpen?: boolean;
    targetSelector?: string;
    items: any[];
}
export class DataForm extends BaseComponent<IDataFormProps, IDataListState>{
    static DataFormCount = 0;
    appliedFieldName: string;
    refs: {
        root: HTMLElement;
    }
    constructor(p) {
        super(p);
        this.appliedFieldName = `data-form-applied${DataForm.DataFormCount}`;

        DataForm.DataFormCount++;
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
    processFields() {
        const { root } = this.refs;
        const fields = Array.from(root.querySelectorAll('.field-accessor')) as HTMLElement[];

        fields.map(fld => fld['componentRef'] as Field).forEach(fld => fld && fld.processDOM());

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
interface DataListPanelProps extends Partial<FabricUI.IDetailsListProps>, IDataPanelProps {
    formMode?: 'modal' | 'callout' | 'panel' | 'section';
    avoidAdd?, avoidDelete?, avoidEdit?: boolean;
    accessor?: string;
}

export class DataListPanel extends BaseComponent<DataListPanelProps, IDataListState>
{
    targetItem: any;
    lastMod: number;
    refs: {
        root: HTMLElement;
    }
    static formModes = {
        dialog: FabricUI.Dialog,
        modal: Modal,
        panel: FabricUI.Panel,
        callout: FabricUI.Callout,
        section: 'section'
    }
    componentDidMount() {

        const { root } = this.refs;
        const { dataFormRef } = (root as any) as { dataFormRef: DataForm };
        if (!dataFormRef) return;
        const { accessor } = this.props;
        let items = dataFormRef.props.onFieldRead(accessor);
        if (!items) {
            dataFormRef.props.onFieldWrite(accessor, []);
            items = dataFormRef.props.onFieldRead(accessor);
        }
        this.repatch({ items });
    }
    render(p = this.props, s = this.state) {
        this.targetItem = this.targetItem || {};
        this.lastMod = this.lastMod || 0;
        const extraPropsOfDetailList: Partial<FabricUI.IDetailsListProps> = {
            items: s.items || [],
            onActiveItemChanged: (selectedItem, selectedItemIndex) => this.repatch({ selectedItem, selectedItemIndex })
        };
        const detailListProps: FabricUI.IDetailsListProps = Object.assign({}, { key: 'datalist' + this.lastMod }, extraPropsOfDetailList, { layoutMode: FabricUI.DetailsListLayoutMode.justified }, p, {});
        detailListProps.columns = detailListProps.columns && detailListProps.columns.map(col => Object.assign({}, col, { name: i18n.get(col.name) }));
        detailListProps.columns = detailListProps.columns ||
            React.Children.map(this.props.children || [], (child: JSX.Element) => child.props && (child.props as IFieldProps).accessor)
                .filter(x => !!x).map(key => ({ key, fieldName: key, name: Field.getLabel(key) })) as FabricUI.IColumn[];

        const callOutTarget = s.targetSelector && this.refs.root.querySelector(s.targetSelector);
        const detailList = React.createElement(FabricUI.DetailsList, detailListProps);
        if (s.targetSelector && s.targetSelector.includes('delete'))
            setTimeout(() => OrganicUI.Utils.makeReadonly(this.refs['dataForm']), 100);


        const targetClick = targetSelector => () => this.repatch(s.targetSelector == targetSelector ? { isOpen: false, targetSelector: null } : { isOpen: true, targetSelector });
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
                        <div className="column title is-4">{i18n(s.targetSelector.replace('.', '').replace('-button', ''))}</div>
                        <div className="column" style={{ 'flex': 1, fontSize: '15pt' }} dir="ltr" >
                            <a href="#" className="close" onClick={e => {
                                e.preventDefault();
                                this.repatch({ isOpen: false, targetSelector: null });
                            }}> <i className="fa fa-times"></i></a>
                        </div>

                    </div>
                    <div ref="dataForm">
                        {React.createElement(DataForm,
                            {
                                onFieldRead: fieldName => this.targetItem[fieldName],
                                onFieldWrite: (fieldName, value) => this.targetItem[fieldName] = value
                            }, p.children)}
                    </div>
                    <footer>
                        {!s.selectedItem

                            && <FabricUI.DefaultButton primary={!s.selectedItem}
                                onClick={() => (this.props.items.push(this.targetItem), this.lastMod = +new Date(), this.repatch({ isOpen: false, targetSelector: null }))}
                                disabled={!!s.selectedItem} text='add' iconProps={{ iconName: 'Add' }} />}
                        {!!s.selectedItem && s.targetSelector && <FabricUI.DefaultButton
                            className={s.targetSelector.replace('.', '')}
                            primary={!!s.selectedItem}
                            disabled={!s.selectedItem} text={i18n(s.targetSelector.replace('.', '').replace('-button', '')) as any} />}

                    </footer>

                </div>))
            , detailList].filter(x => !!x);
        return <div className="field-accessor" ref="root">{p.header ? React.createElement(DataPanel, p, ...children) : children}</div>;
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
