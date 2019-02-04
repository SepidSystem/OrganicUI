/// <reference path="../../dts/organic-ui.d.ts" />


import { i18n } from "../core/shared-vars";
import { Icon } from '../controls/inspired-components';
import { BaseComponent } from '../core/base-component';
import { Utils, changeCase } from '../core/utils';
import { Field } from "../data/field";
import { IDataFormAccessorMsg } from "@organic-ui";
import { BindingSource } from "../reinvent/binding-source";
import { Spinner } from "../core/spinner";

interface IState {
    message?: { type, text };
    selectedItem: any;
    capturedValues: any;
    selectedItemIndex: number;
    isOpen?: boolean;
    targetSelector?: string;
    items: any[];
    validated?: boolean;
}

export class DataForm extends BaseComponent<OrganicUi.IDataFormProps, IState> implements OrganicUi.IDeveloperFeatures {
    devPortId: number;
    onFieldWrite?: Function;
    onFieldRead?: Function;
    bindingSource: BindingSource;
    getDevButton() {
        return Utils.renderDevButton('DataForm', this as any);
    }
    setFocusByAcccesor(accessor) {

        accessor = Field.getAccessorName(accessor);
        const fldHtmlElement = Array.from(this.refs.root.querySelectorAll('.field-accessor'))
            .filter(fld => fld.getAttribute('data-accessor-name') == accessor)[0];
        const { componentRef } = fldHtmlElement as any;
        if (componentRef) {
            componentRef.repatch({});
        }
        fldHtmlElement.classList.add('field-targeted');
        Utils.scrollTo(document.body, fldHtmlElement.clientTop, 100);

        const input = fldHtmlElement.querySelector('input');
        try {
            input.focus();
        } catch (exc1) {

        }

        setTimeout(() => fldHtmlElement && fldHtmlElement.classList.remove('field-targeted'), 1500);
    }
    handleInvalidItemClick(e: React.MouseEvent<HTMLElement>) {
        e.preventDefault();
        e.stopPropagation();
        this.setFocusByAcccesor(Utils.getCascadeAttribute(e.currentTarget, 'data-accessor-name', true));
    }
    showInvalidItems(invalidItems = this.invalidItems): JSX.Element {
        if (!invalidItems || !invalidItems.length) return undefined;
        return Utils.failCallout(<ul className="invalid-items">
            {invalidItems
                .filter(invalidItem => !!invalidItem)
                .map(invalidItem => (<li className="invalid-item">
                    <a className="invalid-item" href="#" data-accessor-name={invalidItem.accessor}
                        onClick={this.handleInvalidItemClick.bind(this)}>
                        {i18n(invalidItem.message)}
                    </a>
                </li>
                ))}
        </ul>
        )
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
    constructor(p: OrganicUi.IDataFormProps) {
        super(p);
        this.bindingSource = p.bindingSource || new BindingSource();
        this.onFieldWrite = (bindingPoint, value) => {

            this.bindingSource.setFieldValue(this.props.data, bindingPoint, value);
            const { onChange } = this.props;
            onChange instanceof Function && onChange(this.props.data);
        }

        this.onFieldRead = this.bindingSource.getFieldValue.bind(this.bindingSource, p.data); // = this.props.onFieldRead || ((key) => p.data[key]);

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
        if (p.data instanceof Promise) return <Spinner />
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
        if (!this.refs.root) return;
        this.querySelectorAll<Field>('.field-accessor').forEach(fld => fld.processDOM());
        if (this.props.onCustomRenderWithCaptureValues) {
            const capturedValues = Object.assign({}, ...this.querySelectorAll<Field>('.field-accessor').map(fld => fld.getValuePair()));
            this.repatch({ capturedValues });

        }
        this.querySelectorAll<OrganicUi.IBindableElement>('.bindable').forEach(bindable => bindable.tryToBinding());

    }
    componentDidMount() {
        super.componentDidMount();
        this.processFields()
    }
    componentDidUpdate() {
        this.processFields();
    }

    static defaultProps={
        settings:{
        
        }
    }
}
 