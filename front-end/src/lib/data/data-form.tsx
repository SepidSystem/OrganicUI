/// <reference path="../../dts/organic-ui.d.ts" />


import { i18n } from "../core/shared-vars";
import { Icon } from '../controls/inspired-components';
import { BaseComponent } from '../core/base-component';
import { Utils, changeCase } from '../core/utils';
import { Field } from "../data/field";
import { IDataFormAccessorMsg } from "@organic-ui";

interface IState {
    message?: { type, text };
    selectedItem: any;
    selectedItemIndex: number;
    isOpen?: boolean;
    targetSelector?: string;
    items: any[];
    validated?: boolean;
}

export class DataForm extends BaseComponent<OrganicUi.IDataFormProps, IState> implements OrganicUi.IDeveloperFeatures {
    devPortId: number;
    getDevButton() {
        return Utils.renderDevButton('DataForm', this as any);
    }
    setFocusByAcccesor(accessor) {
        accessor = Field.getAccessorName(accessor);
        this.querySelectorAll<Field>('.field-accessor').filter(fld => Field.getAccessorName(fld.props.accessor) == accessor).forEach(fld => {
            fld.refs.root.classList.add('field-targeted');
            Utils.scrollTo(document.body, fld.refs.root.clientTop, 100);
            fld.refs.root.querySelector('input').focus();
            fld.focus && fld.focus();
            setTimeout(() => fld.refs.root.classList.remove('field-targeted'), 1500);
        })
    }
    showInvalidItems(invalidItems = this.invalidItems): JSX.Element {
        if (!invalidItems || !invalidItems.length) return undefined;
        return (<div className="error-card"   >
            <div className="title is-5 animated fadeIn">
                <Icon iconName="StatusErrorFull" />{'  '}
                {i18n('error')}</div>
            <div className="animated fadeInDown">
                {/*i18n('description-rejected-validation')*/}
                <ul className="invalid-items">
                    {invalidItems
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
    async getFieldErrorsAsElement(): Promise<JSX.Element> {
        const messages: IDataFormAccessorMsg[] = await this.revalidateAllFields();
        if (messages && messages[0])
            this.setFocusByAcccesor(messages[0].accessor);
        return this.showInvalidItems(messages);
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
            .filter(({ error }) => !!error);
    }

    renderContent() {
        const p = this.props;

        return (
            <div className={Utils.classNames("data-form", "developer-features", p.className)} ref="root" style={p.style}>
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
    revalidateAllFields(formData?): Promise<any[]> {
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
