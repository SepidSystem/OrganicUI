import { i18n, icon, editorByAccessor } from "./shared-vars";
import { BaseComponent } from './base-component';
import { changeCase, Utils } from './utils';
import { DataForm } from "./data-form";
import { IComponentRefer, IFieldProps } from "@organic-ui";
import { Menu, MenuItem } from "./inspired-components";

//--------------------------------------------------------------------------------
interface IFieldMessage {
    type: 'info' | 'success' | 'danger';
    message: string;
    by?: string;
}


export interface IFieldState {
    messages?: IFieldMessage[];
    currentOp?: string;
    operatorsMenuIsOpen?: boolean;
}
export interface FilterItem {
    op: string;
    value: string;
    value2?: string;
    values?: string[];
    fieldName: string;
}
const defaultOperators = ['like', 'eq', 'neq', 'lt', 'lte', 'gt', 'gte', 'between'];
export class Field extends BaseComponent<IFieldProps, IFieldState>{

    clientWidthNoErrorMode: number;
    inputElement: React.ReactElement<any>;
    dataForm: DataForm;
    refs: {
        root: HTMLElement;
        container: HTMLElement;
        op: HTMLElement;
    }
    operators: any;

    constructor(p) {
        super(p);
        this.handleSetData = this.handleSetData.bind(this);
        this.handleGetData = this.handleGetData.bind(this);

    }
    getFilterItem(): FilterItem {
        let value = this.extractedValue;
        const op = this.state.currentOp || 'LIKE';

        return { fieldName: this.props.accessor, value, op };
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
            const props = componentRef && componentRef.props as OrganicUi.IFieldReaderWriter;
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
        const inputElement = this.getInputElement();
        const dataType = inputElement.type && inputElement.type['dataType'];
        const value: any = [dataType == 'boolean' ?
            e && e.target && e.target.checked : undefined, e && e.target && e.target.value, e && (e as any).value, e].filter(x => x !== undefined)[0];
        const p = this.props;
        if (p.onSet instanceof Function) return p.onSet(value);
        const { root } = this.refs;
        if (!root) return;

        let parent = root;
        let getters: (string | Function)[] = [];
        const dataForm = this.getDataForm();

        while (parent) {
            const { componentRef } = parent as any;
            const props = componentRef && componentRef.props as OrganicUi.IFieldReaderWriter;
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

    getValueProps(dataType, value) {

        if (dataType == 'boolean') {
            if (value === undefined) return {};
            return { defaultChecked: value, checked: value };
        }
        return { value };
    }
    clear() {
        const orginInputElement = this.inputElement;
        this.inputElement = <NotConnectedInput />;
        setTimeout(() => {
            this.inputElement = orginInputElement;
            this.repatch({});
        }, 1);
        this.extractedValue = null;
        this.repatch({});
    }
    getInputElement(): JSX.Element {
        if (this.inputElement) return this.inputElement;
        const {accessor}=this.props;
        let inputElement = this.props.children as React.ReactElement<any>;
        if (!inputElement)
            inputElement = editorByAccessor(changeCase.camelCase(this.props.accessor));
        const customRenderer = (inputElement.type && inputElement.type[`field-renderMode-${this.props.renderMode}`]);
        console.log({customRenderer,inputElement,accessor,type:inputElement.type});
        if (customRenderer)
            inputElement = customRenderer;

        if (inputElement instanceof Function) inputElement = React.createElement(inputElement as any, {});
        if (this instanceof Field)
            this.inputElement = inputElement;
        return inputElement;
    }
    getCurrentOp() {
        return this.state.currentOp || (this.operators[0]);
    }
    changeEvent: Function;
    createHandleSetData(defaultCb: Function) {
        return !defaultCb ? this.handleSetData.bind(this) : function () {
            defaultCb(...arguments);
            this.handleSetData(...arguments);
        }.bind(this);
    }
    focusEvent: Function;
    createFocusEvent(defaultCb: Function) {
        const cb: Function = e => this.refs.container.classList.add('focused');

        return !defaultCb ? cb : function () {
            defaultCb(...arguments);
            cb(...arguments);
        }.bind(this);
    }
    blurEvent: Function;
    createBlurEvent(defaultCb: Function) {
        const cb: Function = e => {
            const { target } = e;
            setTimeout(() => {
                this.repatch({});
                if (document.activeElement == target) return;
                const { container } = this.refs;
                container && container.classList.remove('focused');
            }, 100);
            this.repatch({});
        }
        return !defaultCb ? cb : function () {
            defaultCb(...arguments);
            cb(...arguments);
        }.bind(this);
    }
    static extractInputType(element: React.ClassicElement<OrganicUi.IFieldProps>) {
        const inputElement = React.Children.only(element.props);
        return inputElement.type;
    }
    renderContent() {
        const p = this.props, s = this.state;
        s.messages = s.messages || p.messages || [];
        const dataForm = this.getDataForm(true);
        const hasError = dataForm && dataForm.props.validate && !!this.getErrorMessage();
        const iconForStatus: string = hasError && '';// 'fa-exclamation-triangle';
        let inputElement = this.getInputElement();
        const inputElementType = inputElement && inputElement.type;
        const classNameFromInputType = inputElementType && inputElementType['field-className'];
        const filterFromInputType: Function = inputElementType && inputElementType['field-filter'];
        this.changeEvent = this.changeEvent || (inputElement && this.createHandleSetData(inputElement.props.onChange));
        this.blurEvent = this.blurEvent || (inputElement && this.createBlurEvent(inputElement.props.onBlur));
        this.focusEvent = this.focusEvent || (inputElement && this.createFocusEvent(inputElement.props.onFocus));
        const classNameForField = inputElement && inputElement.type && inputElement.type['classNameForField'];
        const propsOfInputElement = inputElement && Object.assign({}, inputElement.props,
            {
                onChange: this.changeEvent,
                onChanged: this.changeEvent,
                onFocus: this.focusEvent,
                onBlur: this.blurEvent,
                className: Utils.classNames(inputElement.props && inputElement.props.className)
            }, this.getValueProps(inputElement && inputElement.type && inputElement.type['dataType'], this.extractedValue)
        );
        console.assert(filterFromInputType === undefined || filterFromInputType instanceof Function, 'filterFromInputType is not function', filterFromInputType);
        const label = Field.getLabel(p.accessor, p.label);
        filterFromInputType && filterFromInputType(propsOfInputElement, this, label);
        const { root } = this.refs;
        if (!root && s.messages && s.messages[0])
            setTimeout(() => this.repatch({}), 100);

        if (root && (!s.messages || !s.messages[0]))
            this.clientWidthNoErrorMode = root.clientWidth;
        inputElement = inputElement && React.cloneElement(inputElement, propsOfInputElement);
        if (p.onlyInput) return inputElement;
        const hasValue = (this.extractedValue !== undefined) && (this.extractedValue !== null);
        const { clientWidthNoErrorMode } = this;
        const style: React.CSSProperties = !!clientWidthNoErrorMode ? {
            maxWidth: `${clientWidthNoErrorMode}px`,
            width: `${clientWidthNoErrorMode}px`,
            minWidth: `${clientWidthNoErrorMode}px`
        } : {};
        this.operators = this.operators || p.operators || inputElementType['filterOperators'] || defaultOperators;
        return (<div ref="root" key="root" className={Utils.classNames("field-accessor", classNameForField)} style={style} >

            <div ref="container" key="container" className={Utils.classNames("field  is-horizontal  ", classNameFromInputType, hasValue && 'has-value', p.className)}>

                <label key="label" className="label">{label}</label>
                <div key="control" className={Utils.classNames("control", !!p.icon && "has-icons-left", !!iconForStatus && "has-icons-right")}>
                    {inputElement}

                    {!!p.icon && <span key="icon" className="icon is-small is-left">
                        {icon(p.icon)}
                    </span>}
                    {!!iconForStatus && <span key="icon2" className="icon is-small is-right">
                        <i className={iconForStatus.split('-')[0] + ' ' + iconForStatus}></i>
                    </span>}

                </div>



                {!!p.showOpeartors && <div className="messages fadeInUp" style={{ visibility: (s.messages && s.messages[0] ? 'visible' : 'hidden') }} >
                    {this.clientWidthNoErrorMode && root && s.messages && s.messages[0] &&
                        <p style={{ width: `${this.clientWidthNoErrorMode}px`, maxWidth: `${this.clientWidthNoErrorMode}px` }} className={`custom-help help is-${s.messages[0].type}`}>{i18n(s.messages[0].message)}</p>}

                </div>}
                {!!p.showOpeartors && <a href="#" ref="op"


                    className="op" style={{ width: !!s.operatorsMenuIsOpen ? '100%' : 'auto', display: 'flex', alignItems: 'center' }} onClick={(e) => (e.preventDefault(), this.getOperatorFromUser())} >
                    <i className="fa fa-ellipsis-v" style={{ margin: '2px 0px 0 5px' }}></i>
                    {i18n('operator-' + this.getCurrentOp())}</a>}
                {!!s.operatorsMenuIsOpen && <Menu
                    anchorEl={this.refs.op}

                    open={true}
                    onClose={this.handleCloseForMenuOperators.bind(this)}
                >
                    {this.operators.map(operator =>
                        (
                            <MenuItem style={{ minWidth: root && ((root.clientWidth - 30) + 'px') }} data-operator={operator} onClick={this.handleCloseForMenuOperators.bind(this)}>{i18n(`operator-${operator}`)}</MenuItem>
                        )
                    )}
                </Menu>}
            </div>

        </div>)

    }
    handleCloseForMenuOperators(e) {
        let target: HTMLElement = e && e.target;

        this.repatch({ operatorsMenuIsOpen: false });
        if (target) {
            let currentOp = null;
            while (!currentOp && target) {
                currentOp = target.getAttribute('data-operator');
                target = target.parentElement;
            }
            if (currentOp) this.repatch({ currentOp });
        }
    }
    getOperatorFromUser() {
        /*   const defaultValues = { op: this.getCurrentOp() };
           AppUtils.showDataDialog(<DataForm>
               <Field accessor="op">
                   <ComboBox items={this.props.operators} />
            </Field>
           </DataForm>, { defaultValues }).then(({ op }) => this.repatch({ currentOp: op }));*/
        this.repatch({ operatorsMenuIsOpen: true });
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

        let inputElement = this.getInputElement();
        const dataType: string = inputElement && inputElement.type && inputElement.type['dataType'];
        if (dataType == 'boolean' && this.refs.root) {
            const htmlCheckBox = this.refs.root.querySelector('input[type=checkbox]') as HTMLInputElement;
            if (htmlCheckBox &&
                (!!this.extractedValue !== htmlCheckBox.checked))
                Utils.simulateClick(htmlCheckBox);

        }
    }
    componentDidMount() {
        super.componentDidMount();
        this.processDOM();
    }
    componentDidUpdate() {
        this.processDOM();
    }
    getErrorMessage() {
        let val = this.handleGetData(), p = this.props;
        if (val instanceof Array && val.length == 0) val = undefined;
        const message = ((p.messages || []).filter(msg => msg.type == 'danger').map(msg => msg.message)[0])

            || (p.required && typeof val != 'number' && !val && 'error-required')
            || (p.onErrorCode instanceof Function) && p.onErrorCode(val);
        return message && Utils.i18nFormat(message, changeCase.paramCase(p.accessor));

    }
    revalidate({ customInvalidItems } = { customInvalidItems: null }) {
        const s = this.state, p = this.props;

        const message = this.getErrorMessage();
        s.messages = (p.messages || []).concat(!message ? [] : [{ message, type: 'danger' }])
            .concat(customInvalidItems instanceof Array ? customInvalidItems.
                filter(invalidItem => invalidItem.accessor == p.accessor) : []);

        this.forceUpdate();
        return !!message && { accessor: p.accessor, message };
    }
    getTextReader() {
        const { children } = this.props;
        const inputElement = Field.prototype.getInputElement.apply(this);
        const type = inputElement && inputElement.type;
        const textReader = (type && type.textReader);
        return textReader && (val => textReader(this, children && children.props, val));
    }
}
const defaultTextReader = (fld, props, s) => s;

//--------------------------------------------------------------------------------
interface ObjectFieldState {

}
interface ObjectFieldProps {
    data: Object;
    pattern: string;
}
interface ObjectFieldPattern {

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

export function bind(fakeFn: () => any) {

}
function NotConnectedInput(p) {
    return <input style={{ visibility: 'hidden' }} />
}
