import { BaseComponent } from "../core/base-component";
import { DataList } from "./data-list";
import { DataForm } from "./data-form";
import { Callout, Dialog, Modal, DefaultButton, MessageBar, Button } from "../controls/inspired-components";
import { Utils } from "../core/utils";
import { IDetailsListProps, DetailsListLayoutMode, Selection, SelectionMode } from "office-ui-fabric-react/lib/DetailsList";
import { i18n } from "../core/shared-vars";
import { PanelType } from "office-ui-fabric-react/lib-es2015/Panel";
import { AdvButton } from "../core/ui-elements";
import { MessageBarType } from "office-ui-fabric-react/lib-es2015/MessageBar";
import { DataPanel } from './data-panel';
import { Field } from "../data/field";
import { BindingSource } from "../reinvent/binding-source";
import { EditIcon, DeleteIcon } from "../controls/icons";

interface IState {
    message?: { type, text };
    selectedItem: any;
    selectedItemIndex: number;
    isOpen?: boolean;
    targetSelector?: string;
    items: any[];
    validated?: boolean;
}
export class DataListPanel extends BaseComponent<OrganicUi.DataListPanelProps, IState>
    implements OrganicUi.IBindableElement {
    private targetItem: any;


    items: any[];
    lastMod: number;
    selection: Selection;
    refs: {
        root: HTMLElement;
        dataForm: DataForm;
        dataFormWrapper: HTMLElement;
        datalist: DataList;
    }
    static formModes = {
        dialog: Dialog,
        modal: Modal,
        callout: Callout,
        section: 'section'
    }
    dataList: React.CElement<OrganicUi.DataListPanelProps, never>;
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
        const { accessor } = this.props;

        while (parent) {
            const { componentRef } = (parent as any) as { componentRef: DataForm };
            if (componentRef) {
                const { onFieldRead, onFieldWrite } = componentRef;

                if (onFieldRead instanceof Function && onFieldWrite instanceof Function) {
                    let items = onFieldRead(accessor);
                    if (!items) {
                        onFieldWrite(accessor, []);
                        items = onFieldRead(accessor);
                    }
                    this.items = items;
                    return items;

                }
            }
            parent = parent.parentElement;
        }

    }

    getCustomBar(customBar = this.props.customBar) {
        const callback = (promise: Promise<any>, key) => {
            if (promise instanceof Promise)
                promise.then(value => {
                    const items = this.getItems() || [];
                    items.push(value);
                    if (value['renew'])
                        callback(this.props.customBar[key](), key);
                    this.refs.datalist && this.refs.datalist.reload();
                    this.forceUpdate();
                });
        }
        return Utils.renderButtons(customBar, {
            callback
        });
    }
    afterActiveItemChanged(selectedItem, selectedItemIndex) {
        this.targetItem = JSON.parse(JSON.stringify(selectedItem));
        this.repatch({ selectedItem, selectedItemIndex })
    }
    doAction(actionId: ('add' | 'edit' | 'delete')) {
        this.doTargetClick(`.${actionId}-button`);
    }
    doTargetClick(targetSelector: string) {

        if (targetSelector && targetSelector.includes('add')) {
            this.targetItem = {};
        }
        const isClose = this.state.targetSelector == targetSelector;
        this.repatch(isClose ?
            { validated: false, isOpen: false, targetSelector: null, message: null } :
            { message: null, validated: false, isOpen: true, targetSelector });
    }
    render(p = this.props, s = this.state) {
        this.selection = this.selection || new Selection({ selectionMode: SelectionMode.single });
        const header =
            p.header === undefined ? (p.pluralName && Utils.i18nFormat('header-for-data-list-panel', p.pluralName)) : p.header;
        this.targetItem = this.targetItem || {};
        this.lastMod = this.lastMod || +new Date();
        const items = this.getItems();
        const extraPropsOfDetailList: Partial<IDetailsListProps> = {
            items,

            onActiveItemChanged: this.afterActiveItemChanged.bind(this)
        };
        if (!items) {
            setTimeout(() => this.tryToBinding(), 20);
        }

        this.dataListProps = this.dataListProps || Object.assign({ noBestFit: true } as OrganicUi.IDataListProps,
            {
                ref: 'datalist',
                selection: this.selection,
                loader: () => {

                    if (window['loaderDebug'])
                        debugger;

                    return Promise.resolve(this.items);
                }, height: p.dataListHeight,
                paginationMode: 'scrolled'
            },

            { key: 'datalist' + this.lastMod },
            extraPropsOfDetailList,
            {

                customActions: this.props.customActions ||
                    {
                        edit: this.doTargetClick.bind(this, '.edit-button'),
                        remove: this.doTargetClick.bind(this, '.delete-button')
                    },
                customActionRenderer: this.props.customActionRenderer || function (funcName) {
                    const icon = funcName == 'edit' ? EditIcon : DeleteIcon;
                    return icon ? React.createElement(icon, {}) : funcName as any
                }
            },
            { layoutMode: DetailsListLayoutMode.justified }, p, {});
        const callOutTarget = s.targetSelector && this.refs.root.querySelector(s.targetSelector);

        this.dataList = this.dataList || React.createElement(DataList as any, this.dataListProps, p.children) as any;
        if (s.targetSelector && s.targetSelector.includes('delete'))
            setTimeout(() => OrganicUI.Utils.makeReadonly(this.refs['dataFormWrapper']), 100) as any;



        s.targetSelector = s.targetSelector || '';
        if (s.targetSelector.includes('add')) s.selectedItem = null;
        const targetClick = s => () => this.doTargetClick(s);
        const children = [p.customBar && this.getCustomBar(), !p.customBar && !p.avoidAdd &&
            <DefaultButton primary className="add-button" onClick={targetClick('.add-button')} iconProps={{ iconName: 'Add' }} text={i18n('add') as any} />,
        !p.customBar && !p.avoidEdit && false &&
        <DefaultButton className="edit-button" disabled={!s.selectedItem} onClick={targetClick('.edit-button')} iconProps={{ iconName: 'Edit' }} text={i18n('edit') as any} />,
        !p.customBar && !p.avoidDelete && false &&
        <DefaultButton className="delete-button" disabled={!s.selectedItem} onClick={targetClick('.delete-button')} iconProps={{ iconName: 'Delete' }} text={i18n('delete') as any} />,
        !!this.dataList && <hr style={{ margin: '4px 0' }} />,
        !!this.dataList && <div className="dataList-wrapper" >{this.dataList} </div>,
        !!p.children && s.isOpen && this.renderCallout(callOutTarget)]

            .filter(x => !!x);

        return <div className={Utils.classNames("data-list-panel-wrapper bindable", p.className)} ref="root" style={p.style}>
            {header ? React.createElement(DataPanel, Object.assign({}, p, { header }), ...children) : children}</div>;
    }
    renderCallout(target) {
        const s = this.state, p = this.props;
        return React.createElement((DataListPanel.formModes[p.formMode] || Callout) as any, {
            className: "data-list-panel-fields",
            ref: "panel",
            isOpen: s.isOpen, dialogDefaultMinWidth: '400px', dialogDefaultMaxWidth: '500px',
            type: PanelType.large,
            hasCloseButton: false,
            onDismiss: () => this.repatch({ isOpen: false, targetSelector: null }),
            target
        } as any, (
                <div style={{ padding: '10px 20px' }}>
                    <div className="columns">
                        <div className="column   is-11   " style={{ display: 'flex', alignItems: 'center' }}>
                            <div className="title is-3">
                                {Utils.i18nFormat(s.targetSelector.concat('-header-fmt').replace('.', '').replace('-button', ''), p.singularName)}
                            </div>
                        </div>
                        <div className="column" style={{ 'flex': 1, fontSize: '15pt' }} dir="ltr" >
                            <a href="#" className="close" onClick={e => {
                                e.preventDefault();
                                this.repatch({ isOpen: false, targetSelector: null });
                            }}> <i className="fa fa-times"></i></a>
                        </div>

                    </div>

                    <div ref="dataFormWrapper" className={p.contentClassName}>
                        {s.targetSelector && !s.targetSelector.includes('delete') && React.createElement(DataForm,
                            {
                                ref: "dataForm",
                                data: this.targetItem,
                                onErrorCode: p.onErrorCode,
                                validate: s.validated
                            },
                            React.Children.toArray(p.children)
                                .filter(fld => fld && fld['type'] == Field)
                        )
                        }

                    </div>
                    <footer>
                        {!s.selectedItem
                            && <AdvButton primary
                                onClick={() => {
                                    const { dataForm } = this.refs;
                                    console.assert(!!dataForm, 'dataForm is null');
                                    dataForm.revalidateAllFields().then(invalidItems => {
                                        this.repatch({ validated: true });
                                        if (invalidItems && invalidItems.length) {

                                            invalidItems = invalidItems.filter(x => !!x);
                                            this.repatch(
                                                {
                                                    message: {
                                                        text: i18n(invalidItems[0].message),
                                                        type: MessageBarType.error
                                                    }
                                                });
                                            setTimeout(() => this.repatch({ message: null }), 3000);
                                            return;
                                        }
                                        this.items = this.getItems();
                                        this.items.push(this.targetItem);
                                        this.lastMod = +new Date();
                                        this.refs.datalist.reload().then(() => {
                                            this.repatch({ isOpen: false, targetSelector: null, message: { text: i18n('add-success'), type: MessageBarType.success } });

                                            setTimeout(() => {
                                                this.refs.datalist.scrollToIndex(this.items.length - 1);
                                            }, 200);
                                            setTimeout(() => {
                                                this.items.forEach((_, idx) => this.selection.setIndexSelected(idx, idx == this.items.length - 1, false));
                                                this.afterActiveItemChanged(this.targetItem, this.items.length - 1);
                                            }, 500);

                                        });

                                    });
                                }}
                                disabled={!!s.selectedItem}  >
                                {i18n('add')}</AdvButton>}
                        {!!s.selectedItem && s.targetSelector && <OrganicUI.AdvButton
                            className={s.targetSelector.replace('.', '')}
                            onClick={() => {
                                const { dataForm } = this.refs;
                                console.assert(!!dataForm, 'dataForm is null');
                                if (s.targetSelector && s.targetSelector.includes('edit') &&
                                    typeof s.selectedItemIndex == 'number') {
                                    this.repatch({ validated: true });
                                    this.items[s.selectedItemIndex] = JSON.parse(JSON.stringify(this.targetItem));
                                }
                                if (s.targetSelector && s.targetSelector.includes('delete') &&
                                    typeof s.selectedItemIndex == 'number') {
                                    this.items.splice(s.selectedItemIndex, 1);
                                }
                                this.refs.datalist && this.refs.datalist.reload().then(() => {
                                    this.repatch({ validated: true, isOpen: false, targetSelector: null, message: null });
                                    let selectedItemIndex = s.selectedItemIndex;
                                    if (selectedItemIndex >= this.items.length) selectedItemIndex = this.items.length - 1;
                                    setTimeout(() => {
                                        this.items.forEach((_, idx) => this.selection.setIndexSelected(idx, idx == selectedItemIndex, false));
                                    }, 500);

                                });

                            }}
                            primary={!!s.selectedItem}
                            disabled={!s.selectedItem} >{i18n(s.targetSelector.replace('.', '').replace('-button', '')) as any}</OrganicUI.AdvButton>}

                    </footer>
                    {!!this.state.message && <div> <MessageBar messageBarType={this.state.message.type} >{this.state.message.text} </MessageBar>
                    </div>}
                </div>));
    }
    static defaultProps: {
        contentClassName: 'half-column-fields'
    }
}
