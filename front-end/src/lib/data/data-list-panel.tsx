import { BaseComponent } from "../core/base-component";
import { DataList } from "./data-list";
import { DataForm } from "./data-form";
import { Callout, Dialog, Modal as _Modal, MessageBar, Button } from "../controls/inspired-components";
import { Utils } from "../core/utils";
import { IDetailsListProps, DetailsListLayoutMode, Selection, SelectionMode } from "office-ui-fabric-react/lib/DetailsList";
import { i18n } from "../core/shared-vars";
import { AdvButton } from "../core/ui-elements";
import { MessageBarType } from "office-ui-fabric-react/lib/MessageBar";
import { DataPanel } from './data-panel';
import { Field } from "../data/field";
import { EditIcon, DeleteIcon, ViewIcon } from "../controls/icons";
function Modal(p) {
    const { children, dataFormHeight: maxHeight, ...otherProps } = p;
    return <_Modal {...otherProps}>
        <section className="inner" style={{ maxHeight, overflowY: maxHeight ? 'scroll' : undefined, overflowX: maxHeight ? 'hidden' : null }}>
            {children}
        </section>
    </_Modal>
}
interface IState {
    formSettings: any;
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
    static _targetItem: null;
    static getActiveData() {
        return DataListPanel._targetItem || {};
    }
    static bindDetailField(fieldName) {
        return function () {
            const targetItem = DataListPanel.getActiveData();
            return targetItem[fieldName];
        }
    }
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
            callback, args: [this.getItems()]
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
        const requireToNewItem = targetSelector && targetSelector.includes('add');

        if (requireToNewItem) this.targetItem = {};
        const isClose = this.state.targetSelector == targetSelector;
        this.repatch(isClose ?
            { validated: false, isOpen: false, targetSelector: null, message: null } :
            { message: null, validated: false, isOpen: true, targetSelector });
    }
    async handleAction(...args) {
        const result = this.props.onActionExecute(...args);
        if (result.isFieldHidden || result.isFieldReadonly) {
            await this.repatch({ formSettings: result });
            return;
        }
        else await this.repatch({ formSettings: null });
        return result;

    }
    renderContent(p = this.props, s = this.state) {
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
        const defaultActions = {
            edit: this.doTargetClick.bind(this, '.edit-button'),
            view: this.doTargetClick.bind(this, '.view-button'),
            remove: this.doTargetClick.bind(this, '.delete-button')
        }
        const customActions = Object.assign({}, this.props.customActions || { edit: true, remove: true });
        for (let key in customActions) {
            const value = customActions[key];
            if (value === true)
                customActions[key] = defaultActions[key];
        }
        const childArray: any[] = React.Children.toArray(this.props.children);
        const dataListFields = childArray.filter(c => c.props && c.type == Field && !c.props.dataEntryOnly);
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

            { layoutMode: DetailsListLayoutMode.justified }, p, { children: dataListFields },
            {
                customActions,
                customActionRenderer: this.props.customActionRenderer || function (funcName) {
                    const func = customActions[funcName];
                    const icon = func && func.icon || IconByAction[funcName];
                    if (React.isValidElement(icon)) return icon;
                    return icon ? React.createElement(icon, {}) : funcName as any
                }
            } as Partial<OrganicUi.IDataListProps>);
        const callOutTarget = s.targetSelector && this.refs.root.querySelector(s.targetSelector);

        this.dataList = this.dataList || React.createElement(DataList as any, this.dataListProps, dataListFields) as any;
        if (s.targetSelector && s.targetSelector.includes('delete'))
            setTimeout(() => OrganicUI.Utils.makeReadonly(this.refs['dataFormWrapper']), 100) as any;



        s.targetSelector = s.targetSelector || '';
        if (s.targetSelector.includes('add')) s.selectedItem = null;
        const targetClick = s => this.doTargetClick.bind(this, s);
        const children = [p.customBar && this.getCustomBar(), !p.customBar && !p.avoidAdd &&
            <Button variant="outlined" color="secondary" className="add-button" onClick={targetClick('.add-button')}    >{i18n('add')}</Button>,
        !!this.dataList && <hr style={{ margin: '4px 0' }} />,
        !!this.dataList && <div className="dataList-wrapper" >{this.dataList} </div>,
        !!p.children && s.isOpen && this.renderCallout(callOutTarget)]

            .filter(x => !!x);

        return <div className={Utils.classNames("data-list-panel-wrapper bindable", p.className)} ref="root" style={p.style}>
            {header ? React.createElement(DataPanel, Object.assign({}, p, { header }), ...children) : children}</div>;
    }
    renderCallout(target) {
        const s = this.state, p = this.props;
        DataListPanel._targetItem = this.targetItem;
        return React.createElement((DataListPanel.formModes[p.formMode] || Modal) as any, {
            className: "data-list-panel-fields",
            ref: "panel",
            isOpen: s.isOpen, dialogDefaultMinWidth: '400px', dialogDefaultMaxWidth: '500px',
            hasCloseButton: false,
            disableBackdropClick: true,
            disableEscapeKeyDown: true,
            onDismiss: () => this.repatch({ isOpen: false, targetSelector: null }),
            dataFormHeight: p.dataFormHeight,
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
                                validate: s.validated,
                                readonly: s.targetSelector && s.targetSelector.includes('view'),
                                settings: s.formSettings
                            } as Partial<OrganicUi.IDataFormProps>,
                            React.Children.toArray(p.children)
                                .filter(fld => fld && fld['type'] == Field)
                        )
                        }

                    </div>
                    <footer>
                        {!s.selectedItem
                            && <AdvButton primary variant="raised"
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
                                        const { datalist } = this.refs;
                                        datalist.reload().then(() => {
                                            this.repatch({ isOpen: false, targetSelector: null, message: { text: i18n('add-success'), type: MessageBarType.success } });

                                            setTimeout(() => {
                                                datalist
                                                    && datalist.scrollToIndex instanceof Function
                                                    && datalist.scrollToIndex(this.items.length - 1);
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
                            variant="raised"
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
        formMode: 'modal'
    }
}


const IconByAction = {
    view: ViewIcon,
    edit: EditIcon,
    remove: DeleteIcon
}