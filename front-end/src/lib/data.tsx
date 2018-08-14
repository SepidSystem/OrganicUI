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
    value?: string;
    value2?: string;
    values?: string[];
    fieldName: string;
}
const defaultOperators = ['like', 'eq', 'neq', 'lt', 'lte', 'gt', 'gte', 'between'];
export class Field extends BaseComponent<IFieldProps, IFieldState>{
    focus() {
        const inputElement = this.getInputElement('default') as any;
        inputElement && inputElement.focus && inputElement.focus();
    }

    fixedClientWidth: number;
    fixedAcutalClientWidth: number;
    inputElements: { [key: string]: React.ReactElement<any> } = {};
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

        const op = (this.state.currentOp || 'LIKE').toLowerCase();
        const p = this.props;
        return Object.assign({},
            {
                value: this.extractedValues['default'],
                fieldName: Field.getAccessorName(p.accessor),
                op: (operatorsForServerSideMap[op] || op)
            },
            p.filterData || {},
            this.extractedValues['alt'] !== undefined ? { value2: this.extractedValues['alt'] } : {});

    }
    static getLabel = (accessor, label?) => i18n(label || changeCase.paramCase(accessor))
    static getLabelText = (accessor, label?) => i18n.get(label || changeCase.paramCase(accessor))
    extractedValues: { default?, alt?} = {};
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
    handleGetData(prefix) {
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
            value = value && value[accessorPath.shift()];
            if (!(value instanceof Object)) break;
        }
        return value;
    }
    handleSetData(e: React.ChangeEvent<HTMLInputElement>, prefix: string) {
        prefix = prefix || 'default';
        const inputElement = this.getInputElement(prefix);

        const dataType = inputElement.type && inputElement.type['dataType'];
        const value: any = [dataType == 'boolean' ?
            e && e.target && e.target.checked : undefined, e && e.target && e.target.value, e && (e as any).value, e].filter(x => x !== undefined)[0];
        const p = this.props;
        p.onChange instanceof Function && p.onChange(value);
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
                if (prefix == 'default')
                    props.onFieldWrite(p.accessor, value);
                else
                    props.onFieldWrite(p.accessor + '__2', value);

                Object.assign(this.extractedValues, { [prefix]: value });

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
        const orginInputElement = Object.assign({}, this.inputElements);
        this.inputElements = {};
        setTimeout(() => {
            Object.keys(this.inputElements).forEach(key => this.inputElements[key] = orginInputElement[key]);

            this.repatch({});
        }, 1);
        this.extractedValues = {};
        Object.keys(this.inputElements).forEach(key => this.inputElements[key] = <NotConnectedInput />);
        this.repatch({});
    }
    getInputElement(prefix: string): JSX.Element {
        if (!this.props.children && this.inputElements && this.inputElements[prefix]) return this.inputElements[prefix];
        let inputElement = this.props.children as React.ReactElement<any>;
        if (!inputElement)
            inputElement = editorByAccessor(changeCase.camelCase(this.props.accessor));
        if (inputElement) {
            const customRenderer = (inputElement.type && inputElement.type[`field-renderMode-${this.props.renderMode}`]);
            if (customRenderer) {
                this.operators = this.operators || customRenderer['filterOperators'];
                inputElement = customRenderer(this.props);
            }
            if (inputElement instanceof Function) {
                inputElement = React.createElement(inputElement as any, {});
                if (this instanceof Field)
                    this.inputElements[prefix] = inputElement;
            }
        }
        return inputElement;
    }
    componentWillMount() {
        this.state.currentOp = this.props.defaultOperator || this.state.currentOp;
    }
    getCurrentOp() {
        return this.state.currentOp || (this.operators[0]);
    }
    changeEvent: Function;
    changeEvent2: Function;
    blurEvent2: Function;
    createHandleSetData(prefix: string, defaultCb: Function) {
        return e => {

            defaultCb && defaultCb(...arguments);
            this.handleSetData(e, prefix);
        };
    }
    focusEvent: Function;
    focusEvent2: Function;
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
        const { currentOp } = this.state;
        const dataForm = this.getDataForm(true);
        const hasError = dataForm && dataForm.props.validate && !!this.getErrorMessage();
        const iconForStatus: string = hasError && '';// 'fa-exclamation-triangle';
        let inputElement = this.getInputElement('default');
        const inputElementType: any = (inputElement && inputElement.type) || {};
        const classNameFromInputType = inputElementType['field-className'];
        this.changeEvent = this.changeEvent || (inputElement && this.createHandleSetData('default', inputElement.props.onChange));
        this.blurEvent = this.blurEvent || (inputElement && this.createBlurEvent(inputElement.props.onBlur));
        this.focusEvent = this.focusEvent || (inputElement && this.createFocusEvent(inputElement.props.onFocus));
        let classNameForField = inputElement && inputElement.type && inputElement.type['classNameForField'];
        if (classNameForField instanceof Function) classNameForField = classNameForField(inputElement.props);
        const propsOfInputElement = inputElement && Object.assign({}, inputElement.props,
            {
                onChange: this.changeEvent,
                onChanged: this.changeEvent,
                onFocus: this.focusEvent,
                onBlur: this.blurEvent,
                className: Utils.classNames(inputElement.props && inputElement.props.className)
            }, this.getValueProps(inputElement && inputElement.type && inputElement.type['dataType'], this.extractedValues['default'])
        );
        inputElement = inputElement && React.cloneElement(inputElement, propsOfInputElement);

        let inputElement2 = currentOp == 'between' && this.getInputElement('alt');
        this.changeEvent2 = this.changeEvent2 || (inputElement2 && this.createHandleSetData('alt', inputElement2.props.onChange));
        this.blurEvent2 = this.blurEvent2 || (inputElement2 && this.createBlurEvent(inputElement2.props.onBlur));
        this.focusEvent2 = this.focusEvent2 || (inputElement2 && this.createFocusEvent(inputElement2.props.onFocus));

        const propsOfInputElement2 = inputElement2 && Object.assign({}, inputElement2.props,
            {
                onChange: this.changeEvent2,
                onChanged: this.changeEvent2,
                onFocus: this.focusEvent2,
                onBlur: this.blurEvent2,
                className: Utils.classNames("alt-input-element", inputElement2.props && inputElement2.props.className)
            }, this.getValueProps(inputElement && inputElement.type && inputElement.type['dataType'], this.extractedValues['alt'])
        );
        inputElement2 = inputElement2 && React.cloneElement(inputElement2, propsOfInputElement2);
        const label = Field.getLabel(p.accessor, p.label);
        const { root } = this.refs;
        if (!root && s.messages && s.messages[0])
            setTimeout(() => this.repatch({}), 100);

        if (root && (!s.messages || !s.messages[0]) && !this.fixedClientWidth)
            this.fixedClientWidth = root.clientWidth;
        if (s.messages && s.messages[0]) this.fixedClientWidth = undefined;
        if (p.onlyInput) return inputElement;
        const hasValue = (this.extractedValues && this.extractedValues['default'] !== undefined) && (this.extractedValues && this.extractedValues['default'] !== null);
        const { fixedClientWidth } = this;
        const style: React.CSSProperties = !p.disableFixedWidth && !!fixedClientWidth ? {
            maxWidth: `${fixedClientWidth}px`,
            width: `${fixedClientWidth}px`,
            minWidth: `${fixedClientWidth}px`
        } : {};
        this.operators = this.operators || p.operators || inputElementType['filterOperators'] || defaultOperators;
        return (<div ref="root" key="root" className={Utils.classNames("field-accessor", classNameForField)} style={style} >

            <div ref="container" key="container" className={Utils.classNames("field  is-horizontal  ", classNameFromInputType, hasValue && 'has-value', p.className)}>

                <label key="label" className="label">{label}</label>
                <div key="control" className={Utils.classNames("control", !!p.icon && "has-icons-left", !!iconForStatus && "has-icons-right")}>
                    {inputElement}
                    {inputElement2}
                    {!!p.icon && <span key="icon" className="icon is-small is-left">
                        {icon(p.icon)}
                    </span>}
                    {!!iconForStatus && <span key="icon2" className="icon is-small is-right">
                        <i className={iconForStatus.split('-')[0] + ' ' + iconForStatus}></i>
                    </span>}

                </div>



                {!!p.showOpeartors && <div className="messages fadeInUp" style={{ visibility: (s.messages && s.messages[0] ? 'visible' : 'hidden') }} >
                    {this.fixedClientWidth && root && s.messages && s.messages[0] &&
                        <p style={{ width: `${this.fixedClientWidth}px`, maxWidth: `${this.fixedClientWidth}px` }} className={`custom-help help is-${s.messages[0].type}`}>{i18n(s.messages[0].message)}</p>}

                </div>}
                {!!p.showOpeartors && <a tabIndex={-1}  ref="op"


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
            if (!currentOp || (currentOp === this.state.currentOp)) return;

            if (currentOp == 'between') {
                this.fixedAcutalClientWidth = this.fixedClientWidth;
                this.fixedClientWidth = this.refs.root.clientWidth * 2;
                Object.assign(window, { field: this });
            }
            else if (this.fixedAcutalClientWidth && this.state.currentOp == 'between')
                this.fixedClientWidth = this.fixedAcutalClientWidth;

            this.repatch({ currentOp });
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
        this.refs.op && (this.refs.op.tabIndex = -1 );
        ['default', 'alt'].forEach(key => {
            let value = this.handleGetData(key);
            if (value instanceof Promise) {
                value = value.then(v => {
                    this.handleSetData(v, key);
                    setTimeout(() => this.repatch({}), 10);
                    return v
                });
                return;
            }
            if (value != this.extractedValues['default']) {
                this.extractedValues['default'] = value;
                setTimeout(() => this.repatch({}), 10);

            }

            const { readonly } = this.props;
            if (readonly)
                Utils.makeReadonly(this.refs.root);
            else Utils.makeWritable(this.refs.root);

            let inputElement = this.getInputElement('default');
            const dataType: string = inputElement && inputElement.type && inputElement.type['dataType'];
            if (dataType == 'boolean' && this.refs.root) {
                const htmlCheckBox = this.refs.root.querySelector('input[type=checkbox]') as HTMLInputElement;
                if (htmlCheckBox &&
                    (!!this.extractedValues['default'] !== htmlCheckBox.checked))
                    Utils.simulateClick(htmlCheckBox);

            }
        });
    }
    componentDidMount() {
        super.componentDidMount();
        this.processDOM();
    }
    componentDidUpdate() {
        this.processDOM();
    }
    static getAccessorName(accessor) {
        accessor = accessor || '';
        return accessor['__name'] || accessor;
    }
    getErrorMessage() {
        let val = this.handleGetData('default'), p = this.props;
        if (val instanceof Array && val.length == 0) val = undefined;
        const message = ((p.messages || []).filter(msg => msg.type == 'danger').map(msg => msg.message)[0])

            || (p.required && typeof val != 'number' && !val && 'error-required')
            || (p.onErrorCode instanceof Function) && p.onErrorCode(val);

        return message && Utils.i18nFormat(message, Field.getLabelText(Field.getAccessorName(p.accessor), p.label));

    }
    revalidate({ customInvalidItems } = { customInvalidItems: null }) {
        const s = this.state, p = this.props;

        const message = this.getErrorMessage();
        const accessor = Field.getAccessorName(p.accessor);
        s.messages = (p.messages || []).concat(!message ? [] : [{ message, type: 'danger' }])
            .concat(customInvalidItems instanceof Array ? customInvalidItems.
                filter(invalidItem => Field.getAccessorName(invalidItem.accessor) == accessor) : []);

        this.forceUpdate();
        return !!message && { accessor: Field.getAccessorName(p.accessor), message };
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

const operatorsForServerSideMap = {
    like: 'LIKE',
    eq: '=',
    neq: '<>',
    lt: '<',
    lte: '<=',
    gt: '>',
    gte: '>=',
    between: 'BETWEEN'
} 
