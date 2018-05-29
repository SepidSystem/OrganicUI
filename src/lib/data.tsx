import { FuncComponent, funcAsComponentClass, Utils, icon, BaseComponent, registryFactory } from "../organicUI";
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
export type ErrorCodeForFieldValidation = string | number;
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
    static Dictionary = registryFactory();
    refs: {
        root: HTMLElement;
    }
    constructor(p) {
        super(p);
        this.handleSetData = this.handleSetData.bind(this);
        this.handleGetData = this.handleGetData.bind(this);

    }
    static getLabel = (accessor, label?) => OrganicUI.i18n(label || OrganicUI.changeCase.paramCase(accessor))
    extractedValue: any;
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
        while (parent) {
            const { componentRef } = parent as any;
            const props = componentRef && componentRef.props as IFieldReaderWriter;
            if (props && props.onFieldWrite)
                return props.onFieldWrite(p.accessor, value);
            parent = parent.parentElement;
        }


    }
    render() {
        const p = this.props, s = this.state;
        s.messages = s.messages || p.messages || [];
        s.messages = s.messages.filter(msg => msg.by != 'info');
        const infoMessage = p.getInfoMessage && p.getInfoMessage();
        infoMessage && s.messages.push({ message: infoMessage, by: 'info', type: 'info' });
        const iconForStatus = null;// 'fa-exclamation-triangle';
        let inputElement = p.children as React.ReactElement<any>;
        if (!inputElement) inputElement = Field.Dictionary(p.accessor) as any;
        if (inputElement instanceof Function) inputElement = React.createElement(inputElement as any, {});
        const st = '';
        const propsOfInputElement = inputElement && Object.assign({}, inputElement.props,
            {
                onChange: this.handleSetData,
                onChanged: this.handleSetData,
                value: this.extractedValue,
                className: Utils.classNames(inputElement.props && inputElement.props.className, st)
            }
        );

        inputElement = inputElement && React.cloneElement(inputElement, propsOfInputElement);
        const label = Field.getLabel(p.accessor, p.label);
        return <div ref="root" className={Utils.classNames("field field-accessor is-horizontal  ", p.className)}>
            <label className="label">{label}</label>
            <div className={Utils.classNames("control", !!p.icon && "has-icons-left", !!iconForStatus && "has-icons-right")}>
                {inputElement}

                {!!p.icon && <span className="icon is-small is-left">
                    {icon(p.icon)}
                </span>}
                {!!iconForStatus && <span className="icon is-small is-right">
                    <i className={iconForStatus.split('-')[0] + ' ' + iconForStatus}></i>
                </span>}

            </div>
            {s.messages && s.messages[0] && <p className="help is-success">{s.messages[0]}</p>}
        </div>
    }
    processDOM() {
        const value = this.handleGetData();
        if (value != this.extractedValue) {
            this.extractedValue = value;
            setTimeout(() => this.forceUpdate(), 10);
        }

        const { readonly } = this.props;

        if (readonly) {

            Utils.makeReadonly(this.refs.root);
        }
        else Utils.makeWritable(this.refs.root);
    }
    componentDidMount() {
        super.componentDidMount();
        this.processDOM();
    }
    componentDidUpdate() {
        this.processDOM();
    }
}
function getErrorCodeFromField(fld: Field) {
    const val = fld.handleGetData();
    const fldProps = fld.props;
    if (fldProps.required && !val) return 'error-required';
    if (fldProps.customValidation) return fldProps.customValidation(val);
    return 0;
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
