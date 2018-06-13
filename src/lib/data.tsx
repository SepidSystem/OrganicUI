import { registryFactory } from "./registry-factory";
import { FuncComponent, funcAsComponentClass } from "./functional-component";
import { i18n, icon } from "./shared-vars";
import { BaseComponent } from './base-component';
import { changeCase, Utils } from './utils';
import * as React from "react";
import { ReactNode } from "react";
import { DataForm } from "./data-form";

//--------------------------------------------------------------------------------
interface IFieldMessage {
    type: 'info' | 'success' | 'danger';
    message: string;
    by?: string;
}
export interface IFieldReaderWriter {

    onFieldWrite?, onFieldRead?: Function;
    accessor?: string;
}
export type ErrorCodeForFieldValidation = string;
export interface IFieldProps {
    accessor?: string;
    onGet?, onSet?: Function;
    customValidation?: (v: any) => ErrorCodeForFieldValidation;
    label?: any;
    icon?: any;
    required?: boolean;
    readonly?: boolean;
    messages?: IFieldMessage[];
    getInfoMessage?: () => string;
    children: any;
    className?: string;
}
export class Field extends BaseComponent<IFieldProps, IFieldProps>{
    clientWidthNoErrorMode: number;
    inputElement: React.ReactElement<any>;
    static Dictionary = registryFactory();
    dataForm: DataForm;
    refs: {
        root: HTMLElement;
        container: HTMLElement;
    }
    constructor(p) {
        super(p);
        this.handleSetData = this.handleSetData.bind(this);
        this.handleGetData = this.handleGetData.bind(this);

    }
    static getLabel = (accessor, label?) => i18n(label || changeCase.paramCase(accessor))
    extractedValue: any;
    getDataForm(avoidAssertion?) {
        const { root } = this.refs;
        !avoidAssertion && console.assert(!!root, 'root is null @ getDataForm');
        let parent = root as HTMLElement;
        while (!this.dataForm && parent) {
            this.dataForm = (parent.classList.contains('data-form')
                && (((parent as any) as IComponentRefer<DataForm>).componentRef))
            parent = parent.parentElement;
        }
        return this.dataForm;

    }
    handleGetData() {
        const p = this.props;
        if (p.onGet instanceof Function) return p.onGet();
        const { root } = this.refs;
        if (!root) return;

        let parent = root;
        let getters: (string | Function)[] = [];
        while (parent) {
            const { componentRef } = parent as any;
            const props = componentRef && componentRef.props as IFieldReaderWriter;
            if (props) {
                const value = props.onFieldRead || props.accessor;
                value && getters.push(value);
            }
            parent = parent.parentElement;
        }

        const idxForNearestReadFieldFunc = Array.from(getters.entries()).reduceRight((foundIdx, [idx, item]) => {
            if (foundIdx != -1) return foundIdx;
            return (item instanceof Function) ? idx : foundIdx;
        }, -1);
        if (idxForNearestReadFieldFunc < 0) return;
        const accessorPath: string[] = getters.slice(0, idxForNearestReadFieldFunc).reverse() as any;
        const nearestReadFieldFunc = getters[idxForNearestReadFieldFunc] as Function;
        let value: any = nearestReadFieldFunc(accessorPath.shift());

        while (accessorPath.length) {
            value = value[accessorPath.shift()];
            if (!(value instanceof Object)) break;
        }
        return value;
    }
    handleSetData(e: React.ChangeEvent<HTMLInputElement>) {
        const value: any = [e.target && e.target.value, (e as any).value, e].filter(x => x !== undefined)[0];
        const p = this.props;
        if (p.onSet instanceof Function) return p.onSet(value);
        const { root } = this.refs;
        if (!root) return;

        let parent = root;
        let getters: (string | Function)[] = [];
        const dataForm = this.getDataForm();

        while (parent) {
            const { componentRef } = parent as any;
            const props = componentRef && componentRef.props as IFieldReaderWriter;
            if (props && props.onFieldWrite) {
                props.onFieldWrite(p.accessor, value);
                this.extractedValue = value;
                this.repatch({});

                break;
            }
            parent = parent.parentElement;
        }

        dataForm && dataForm.props.validate && this.revalidate();

    }
    render() {
        const p = this.props, s = this.state;
        s.messages = s.messages || p.messages || [];
        const dataForm = this.getDataForm(true);
        const hasError = dataForm && dataForm.props.validate && !!this.getErrorMessage();
        const iconForStatus: string = hasError && '';// 'fa-exclamation-triangle';
        let inputElement = p.children as React.ReactElement<any>;
        if (!inputElement) inputElement = Field.Dictionary(p.accessor) as any;
        if (inputElement instanceof Function) inputElement = React.createElement(inputElement as any, {});
        const st = '';
        const classNameFromInputType = inputElement.type && inputElement.type['field-className'];
        const filterFromInputType: Function = inputElement.type && inputElement.type['field-filter'];

        const propsOfInputElement = inputElement && Object.assign({}, inputElement.props,
            {
                onChange: this.handleSetData,
                //   onChanged: this.handleSetData,
                onFocus: (e: React.KeyboardEvent<any>) => {
                    this.refs.container.classList.add('focused');

                },

                onBlur: (e: React.KeyboardEvent<any>) => {
                    const { target } = e;
                    setTimeout(() => {
                        if (document.activeElement == target) return;
                        this.refs.container.classList.remove('focused');

                    }, 100);
                    this.repatch({});
                },
                value: this.extractedValue,
                className: Utils.classNames(inputElement.props && inputElement.props.className, st)
            }
        );
        console.assert(filterFromInputType === undefined || filterFromInputType instanceof Function, 'filterFromInputType is not function', filterFromInputType);
        const label = Field.getLabel(p.accessor, p.label);
        //if (!this.inputElement) {
        filterFromInputType && filterFromInputType(propsOfInputElement, this, label);
        const { root } = this.refs;
        if (!root && s.messages && s.messages[0]) {
            setTimeout(() => this.repatch({}), 100);

        }
        if (root && (!s.messages || !s.messages[0])) {
            this.clientWidthNoErrorMode = root.clientWidth;
        }
        this.inputElement = inputElement && React.cloneElement(inputElement, propsOfInputElement);
        //}
        return <div ref="root" key="root" className="field-accessor" style={this.clientWidthNoErrorMode &&
            { maxWidth: `${this.clientWidthNoErrorMode}px`, width: `${this.clientWidthNoErrorMode}px`, minWidth: `${this.clientWidthNoErrorMode}px` }
        } >
            <div ref="container" key="container" className={Utils.classNames("field  is-horizontal  ", classNameFromInputType, !!this.extractedValue && 'has-value', p.className)}>
                <label key="label" className="label">{label}</label>
                <div key="control" className={Utils.classNames("control", !!p.icon && "has-icons-left", !!iconForStatus && "has-icons-right")}>
                    {this.inputElement}

                    {!!p.icon && <span key="icon" className="icon is-small is-left">
                        {icon(p.icon)}
                    </span>}
                    {!!iconForStatus && <span key="icon2" className="icon is-small is-right">
                        <i className={iconForStatus.split('-')[0] + ' ' + iconForStatus}></i>
                    </span>}

                </div>



                <div className="messages fadeInUp" style={{ visibility: (s.messages && s.messages[0] ? 'visible' : 'hidden') }} >
                    {this.clientWidthNoErrorMode && root && s.messages && s.messages[0] &&
                        <p style={{ width: `${this.clientWidthNoErrorMode}px`, maxWidth: `${this.clientWidthNoErrorMode}px` }} className={`custom-help help is-${s.messages[0].type}`}>{i18n(s.messages[0].message)}</p>}

                </div>

            </div>




        </div >
    }
    processDOM() {
        let value = this.handleGetData();
        if (value instanceof Promise) {
            value = value.then(v => {
                this.handleSetData(v);
                setTimeout(() => this.repatch({}), 10);
                return v
            });
            return;
        }
        if (value != this.extractedValue) {
            this.extractedValue = value;
            setTimeout(() => this.repatch({}), 10);

        }

        const { readonly } = this.props;
        if (readonly)
            Utils.makeReadonly(this.refs.root);
        else Utils.makeWritable(this.refs.root);
    }
    componentDidMount() {
        super.componentDidMount();
        this.processDOM();
    }
    componentDidUpdate() {
        this.processDOM();
    }
    getErrorMessage() {
        const val = this.handleGetData(), p = this.props;
        const dataForm = this.getDataForm(true);
        const message = ((p.messages || []).filter(msg => msg.type == 'danger').map(msg => msg.message)[0])
            || (dataForm && dataForm.invalidItems && dataForm.invalidItems.
                filter(invalidItem => invalidItem.accessor == p.accessor)
                .map(invalidItem => invalidItem.message)[0])
            || (p.required && !val && 'error-required')
            || (p.customValidation instanceof Function) && p.customValidation(val);
        return message && Utils.i18nFormat(message, changeCase.paramCase(p.accessor));

    }
    revalidate() {
        const s = this.state, p = this.props;

        const message = this.getErrorMessage();
        s.messages = (p.messages || []).concat(!message ? [] : [{ message, type: 'danger' }])
        this.forceUpdate();
        return !!message && { accessor: p.accessor, message };
    }
}


//--------------------------------------------------------------------------------
interface ObjectFieldState {

}
interface ObjectFieldProps {
    data: Object;
    pattern: string;
}
interface ObjectFieldPattern {

}
export class ObjectField extends BaseComponent<ObjectFieldProps, ObjectFieldState>{
    static patterns = registryFactory<ObjectFieldPattern>();
    render() {
        return <span />
    }
}
//--------------------------------------------------------------------------------
interface IFieldSetProps {
    validationSignal: number;
    validationSignals?: any;
    onValidaitonSuccess?: () => void;
    data?: any;
    children: any | any[];
}
interface IFieldSetState {
    validationSignals?: any;
    autoTest: boolean;
    dumpMode: boolean;
}

function getAllChildren(instance): React.Component<any, any>[] {
    const queue: React.Component<any, any>[] = [];
    const toArray = v => v && (v instanceof Array ? v : [v]);
    const current = instance;
    const result = [];
    while (queue.length) {
        const current = queue.shift();
        if (!(current instanceof Object)) continue;
        const children = toArray(instance.children);
        children && queue.push(...children);
        result.push(current);
    }
    return result;

}
interface IUserFieldProps {
    extraFields?: any;
}
const userFields: FuncComponent<IUserFieldProps, IUserFieldProps> = (p, s) => {
    return <span />
}
export const UserFields = funcAsComponentClass<IUserFieldProps, IUserFieldProps>(userFields);
