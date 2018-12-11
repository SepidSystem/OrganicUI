import { i18n, icon, editorByAccessor } from "../core/shared-vars";
import { BaseComponent } from '../core/base-component';
import { changeCase, Utils } from '../core/utils';
import { DataForm } from "../data/data-form";
import { IComponentRefer, IFieldProps } from "@organic-ui";
import { Menu, MenuItem } from "../controls/inspired-components";
import * as errorIcon from '../../../icons/ic_error.svg';
import { BindingPoint } from "../reinvent/binding-source";
import { InputLabel, FormControl } from "@material-ui/core";
//--------------------------------------------------------------------------------
interface IFieldMessage {
    type: 'info' | 'success' | 'danger';
    message: string;
    by?: string;
}


interface IFieldState {
    messages?: IFieldMessage[];
    currentOp?: string;
    operatorsMenuIsOpen?: boolean;
    extractedValues: any;
    initialReadOccured: boolean;
    defautValueOccured: boolean;
}
export interface FilterItem {
    op: string;
    value?: string;
    value2?: string;
    values?: string[];
    fieldName: string;
    fieldType?: string;
}
const defaultOperators = ['like', 'eq', 'neq', 'lt', 'lte', 'gt', 'gte', 'between'];
export class Field extends BaseComponent<IFieldProps, IFieldState>{
    static isField = true;
    readonly: boolean;
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
        this.state.extractedValues = {};
        this.handleSetData = this.handleSetData.bind(this);
        this.handleGetData = this.handleGetData.bind(this);
        this.readonly = p.readonly;
    }
    getValuePair() {
        return { [Field.getAccessorName(this.props.accessor)]: this.state.extractedValues['default'] };
    }
    getInputType() {
        const { children } = this.props;
        return children && children['type'];
    }
    getFilterItem(): FilterItem {

        const op = (this.getCurrentOp() || 'LIKE').toLowerCase();
        const p = this.props;
        const filterItem = Object.assign({},
            {
                value: this.state.extractedValues['default'],
                fieldName: Field.getAccessorName(p.accessor),
                op: (operatorsForServerSideMap[op] || op)
            },
            p.filterData || {},
            this.state.extractedValues['alt'] !== undefined ? { value2: this.state.extractedValues['alt'] } : {});
        const input = this.getInputElement('default');
        const inputType: any = input && input['type'];
        return (inputType && inputType.passFilterItem instanceof Function) ? inputType.passFilterItem(filterItem, p) : filterItem;
    }
    static getLabel = (accessor, label?) => i18n(label || changeCase.paramCase(Field.getAccessorName(accessor)))
    static getLabelText = (accessor, label?) => i18n.get(label || changeCase.paramCase(Field.getAccessorName(accessor)))
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
        const dataForm = this.getDataForm(true);
        if (!dataForm) return;
        if (p.onGet instanceof Function) return p.onGet();
        const result = dataForm.onFieldRead(p.accessor);
        if (this.props.onInitialRead instanceof Function && !this.state.initialReadOccured) {
            this.state.initialReadOccured = true;
            setTimeout(() => this.props.onInitialRead(result, dataForm.props.data), 10);
        }

        return result;
    }
    handleSetDataIsDirty: number;
    handleSetData(e: React.ChangeEvent<HTMLInputElement>, prefix: string) {
        function isSerialize(e) {
            try {
                JSON.stringify(e);
                return true;
            } catch{
                return undefined;
            }
        }
        const now = +new Date();
        if ((now - this.handleSetDataIsDirty) < 50) return;
        this.handleSetDataIsDirty = now;
        try {
            prefix = prefix || 'default';
            const inputElement = this.getInputElement(prefix);
            const dataType = inputElement.type && inputElement.type['dataType'];
            const valueArray = [dataType == 'boolean' ?
                e && e.target && e.target.checked : undefined, e && e.target && e.target.value, e && (e as any).value, isSerialize(e) && e];
            let value: any = valueArray.filter(x => x !== undefined && x !== null)[0];
            const p = this.props;
            p.onChange instanceof Function && p.onChange(value);
            if (p.onSet instanceof Function) return p.onSet(value);
            const { root } = this.refs;
            if (!root) return;
            let parent = root;
            const dataForm = this.getDataForm();
            /*while (parent) {
                const { componentRef } = parent as any;
                const props = componentRef && componentRef.props as OrganicUi.IFieldReaderWriter;
                const onFieldWrite = (props && props.onFieldWrite) || (componentRef && componentRef.onFieldWrite);
                if (onFieldWrite) {
                    onFieldWrite(Field.getAccessorName(p.accessor) + getSuffix(prefix), value);
                    const extractedValues = Object.assign({}, this.state.extractedValues, { [prefix]: value });
                    this.repatch({ extractedValues });
                    break;
                }
                parent = parent.parentElement;
            }
            dataForm && dataForm.props.validate && this.revalidate();*/
            const inputType: any = inputElement && inputElement.type;
            value = inputType && inputType.parseValue ? inputType.parseValue(value, this.props) : value;
            dataForm.onFieldWrite(p.accessor, value);
            const extractedValues = Object.assign({}, this.state.extractedValues, { [prefix]: value });
            this.repatch({ extractedValues, messages: null });
        } finally {
            this.handleSetDataIsDirty = +new Date();
        }
    }

    getValueProps(dataType, value) {
        if (dataType == 'boolean') {
            if (value === undefined) return {};
            return { defaultChecked: value, checked: value };
        }
        return { value };
    }
    static getDisiplayText(p: IFieldProps, value: any) {
        const { children } = p;
        const type = children && children.type;
        return
    }
    clear() {

        const orginInputElement = Object.assign({}, this.inputElements);

        setTimeout(() => {
            Object.keys(this.inputElements).forEach(key => this.inputElements[key] = orginInputElement[key]);

            this.repatch({ extractedValues: {} } as any);
        }, 1);
        setTimeout(() => {
            for (const input of this.querySelectorAll('.input-component'))
                input.clear instanceof Function && input.clear();
        }, 10)
        //     this.state.extractedValues = {};
        for (const key of Object.keys(this.inputElements))
            this.inputElements[key] = <NotConnectedInput />;

        this.repatch({ extractedValues: {} } as any);
    }
    getInputElement(prefix: string): JSX.Element {
        if (this.inputElements && this.inputElements[prefix]) return this.inputElements[prefix];
        let inputElement = this.props.children as React.ReactElement<any>;
        if (!inputElement)
            inputElement = editorByAccessor(changeCase.camelCase(Field.getAccessorName(this.props.accessor)));
        if (inputElement) {
            const customRenderer = (inputElement.type && inputElement.type[`field-renderMode-${this.props.renderMode}`]);
            if (customRenderer) {
                this.operators = this.operators || this.props.operators || customRenderer['filterOperators'];
                inputElement = customRenderer(this.props);
            }
            if (inputElement instanceof Function) {
                inputElement = React.createElement(inputElement as any, {});

            }
            if (this instanceof Field)
                this.inputElements[prefix] = inputElement;
        }
        return inputElement;
    }
    componentWillMount() {
        const inputType = this.getInputType();
        this.state.currentOp = this.props.showOpeartors &&
            (this.props.defaultOperator || (inputType && inputType.defaultOperator) || this.state.currentOp);
    }

    getCurrentOp() {
        return this.state.currentOp || (this.operators[0]);
    }
    changeEvent: Function;
    changeEvent2: Function;
    blurEvent2: Function;
    createHandleSetData(prefix: string, defaultCb: Function) {
        const that = this;
        return function (e) {
            defaultCb && defaultCb(...arguments);
            that.handleSetData(e, prefix);
        };
    }
    focusEvent: Function;
    focusEvent2: Function;
    createFocusEvent(defaultCb: Function) {
        const cb: Function = e => this.refs.container && this.refs.container.classList.add('focused');

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
                const hasValue = (this.state.extractedValues && !Utils.isUndefined(this.state.extractedValues['default']));
                if (!hasValue) {
                    container && container.classList.add('bluring');

                    setTimeout(() => container && container.classList.remove('bluring', 'focused'), 210);
                }
                else container.classList.remove('focused')

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
        if (!this.refs.root) this.state.defautValueOccured = false;
        const { defaultValue } = this.props;

        if (dataForm) {
            const { onFieldValidate } = dataForm.props;
            if ((onFieldValidate instanceof Function) && !onFieldValidate(this.props))
                return this.renderErrorMode('invalid field accessor');


            if (defaultValue !== undefined && !this.state.defautValueOccured) {
                this.state.defautValueOccured = true;
                setTimeout(() => {
                    const currentValue = this.handleGetData('default');
                    if (currentValue === undefined)
                        this.handleSetData(defaultValue instanceof Function ? defaultValue() : defaultValue, 'default')
                }, 300);
            }
        }
        else this.repatch({}, null, 200);
        const hasError = dataForm && dataForm.props.validate && !!this.getErrorMessage();
        const iconForStatus: string = hasError && '';// 'fa-exclamation-triangle';
        let inputElement = this.getInputElement('default');
        const inputElementType: any = (inputElement && inputElement.type) || {};
        const classNameFromInputType = inputElementType['field-className'];
        if (inputElement && !inputElement.props) {

            return <>{p.children}</>;
        }
        this.changeEvent = this.changeEvent || (inputElement && this.createHandleSetData('default', inputElement.props.onChange));
        this.blurEvent = this.blurEvent || (inputElement && this.createBlurEvent(inputElement.props.onBlur));
        this.focusEvent = this.focusEvent || (inputElement && this.createFocusEvent(inputElement.props.onFocus));
        let classNameForField = inputElement && inputElement.type && inputElement.type['classNameForField'];
        if (classNameForField instanceof Function) classNameForField = classNameForField(inputElement.props);
        const { extractedValues } = this.state;
        const valProps = this.getValueProps(inputElement && inputElement.type && inputElement.type['dataType'], 'default' in extractedValues ? extractedValues.default : this.handleGetData('default'));

        if (p.onMirror instanceof Function) {
            return p.onMirror(valProps, p);
        }
        const labelText = Field.getLabelText(p.accessor, p.label);

        const propsOfInputElement = inputElement && Object.assign(inputElementType && inputElementType.hasDataFormProp ? { dataForm } : {}, inputElement.props,
            {
                onChange: this.changeEvent,
                onChanged: this.changeEvent,
                onFocus: this.focusEvent,
                onBlur: this.blurEvent,
                className: Utils.classNames(inputElement.props && inputElement.props.className)
            }, valProps,
            ((inputElementType && inputElementType.defaultPrimaryProps) || {}),
            currentOp == 'between' ? { placeholder: Utils.i18nFormat('from-value-placeholder-fmt', labelText) } : {}
        );
        inputElement = inputElement && React.cloneElement(inputElement, propsOfInputElement);

        const _inputElement2 = this.props.showOpeartors && currentOp == 'between' && this.getInputElement('alt');
        this.changeEvent2 = this.changeEvent2 || (_inputElement2 && this.createHandleSetData('alt', _inputElement2.props.onChange));
        this.blurEvent2 = this.blurEvent2 || (_inputElement2 && this.createBlurEvent(_inputElement2.props.onBlur));
        this.focusEvent2 = this.focusEvent2 || (_inputElement2 && this.createFocusEvent(_inputElement2.props.onFocus));
        const propsOfInputElement2 = _inputElement2 && Object.assign({}, _inputElement2.props,
            {
                onChange: this.changeEvent2,
                onChanged: this.changeEvent2,
                onFocus: this.focusEvent2,
                onBlur: this.blurEvent2,
                className: Utils.classNames("alt-input-element", _inputElement2.props && _inputElement2.props.className),
                editorPrefix: 'alt'
            }, this.getValueProps(inputElement && inputElement.type && inputElement.type['dataType'], this.state.extractedValues['alt'])
            , ((inputElementType && inputElementType.defaultAltProps) || {},
                currentOp == 'between' ? { placeholder: Utils.i18nFormat('to-value-placeholder-fmt', labelText) } : {}
            )
        );
        const inputElement2 = _inputElement2 && React.cloneElement(_inputElement2, propsOfInputElement2);
        const label = Field.getLabel(p.accessor, p.label);

        const { root } = this.refs;
        if (!root && s.messages && s.messages[0])
            setTimeout(() => this.repatch({}), 100);

        if (root && (!s.messages || !s.messages[0]) && !this.fixedClientWidth)
            this.fixedClientWidth = root.clientWidth;
        if (s.messages && s.messages[0]) this.fixedClientWidth = undefined;
        if (p.onlyInput) return inputElement;
        const hasValue = (this.state.extractedValues && !Utils.isUndefined(this.state.extractedValues['default']));
        const { fixedClientWidth } = this;
        const style: React.CSSProperties = Object.assign({}, !p.disableFixedWidth && !!fixedClientWidth ? {

        } : {});
        this.operators = this.operators || this.props.operators || inputElementType['filterOperators'] || defaultOperators;
        let classNameForRoot = Utils.classNames("field-accessor", style && 'fixed-width', currentOp ? "op-" + currentOp : '', classNameForField, hasError && 'has-error', s.messages && s.messages[0] && 'has-message');
        let className = Utils.classNames(p.labelOnTop && 'label-on-top' + p.labelOnTop, "field  is-horizontal  ", classNameFromInputType, ((p.labelOnTop == 'always') || hasValue) && 'has-value', p.className);
        const { adjustFieldClassName } = (inputElementType || {}) as any;
        if (adjustFieldClassName instanceof Function) {
            [classNameForRoot, className] = adjustFieldClassName(inputElement.props, classNameForRoot, className);
        }

        return (<div ref="root" key="root"
            data-accessor-name={Field.getAccessorName(p.accessor)}
            data-message={s.messages && s.messages[0] && s.messages[0].message}
            className={classNameForRoot} style={p.style} >
            {hasError && <div style={{ width: '1.71rem' }} className="error-icon" dangerouslySetInnerHTML={{ __html: errorIcon }}></div>}

            <div ref="container" key="container" className={className}>

                <label key="label" className="label">{currentOp != 'between' && label}</label>
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

                {!p.showOpeartors && <div className="messages fadeInUp" style={{ visibility: (s.messages && s.messages[0] ? 'visible' : 'hidden') }} >
                    {s.messages && s.messages[0] &&
                        <p className={`animated fadeIn custom-help help is-${s.messages[0].type}`}>{i18n(s.messages[0].message)}</p>}

                </div>}
                {!!p.showOpeartors && <a tabIndex={-1} ref="op"
                    className="op" style={{ display: 'flex', alignItems: 'center' }} onClick={(e) => (e.preventDefault(), this.getOperatorFromUser())} >
                    {i18n('operator-' + this.getCurrentOp())}</a>}
                {!!s.operatorsMenuIsOpen && <Menu
                    anchorEl={this.refs.op}
                    anchorOrigin={{
                        horizontal: 'left', vertical: 'top'
                    }}
                    open={true}
                    onClose={this.handleCloseForMenuOperators.bind(this)}
                >
                    {this.operators.map(operator =>
                        (<MenuItem style={{ minWidth: root && ((root.clientWidth - 30) + 'px') }} data-operator={operator} onClick={this.handleCloseForMenuOperators.bind(this)}>{i18n(`operator-${operator}`)}</MenuItem>
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
    makeReadonly() {
        this.readonly = true;
        Utils.makeReadonly(this.refs.root);
    }
    processDOM() {
        const { root } = this.refs;
        root && Array.from(root.querySelectorAll('.error-icon svg title')).forEach(
            title => title.innerHTML = root.getAttribute('data-message')
        )
        this.refs.op && (this.refs.op.tabIndex = -1);
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
            if (Object.keys(this.state.extractedValues).length == 0 && (value != this.state.extractedValues['default'])) {
                this.state.extractedValues['default'] = value;
                setTimeout(() => this.repatch({}), 10);

            }

            const { readonly } = this;
            if (readonly)
                Utils.makeReadonly(this.refs.root);
            else Utils.makeWritable(this.refs.root);

            let inputElement = this.getInputElement('default');
            const dataType: string = inputElement && inputElement.type && inputElement.type['dataType'];
            if (dataType == 'boolean' && this.refs.root) {
                const htmlCheckBox = this.refs.root.querySelector('input[type=checkbox]') as HTMLInputElement;
                if (htmlCheckBox &&
                    (!!this.state.extractedValues['default'] !== htmlCheckBox.checked))
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

            || (p.required && Utils.isUndefined(val) && 'error-required')
            || (p.onErrorCode instanceof Function) && p.onErrorCode(val);
        const s = Field.getLabelText(p.accessor, p.label);
        const result = message && Utils.i18nFormat(message, s);
        return result;

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
    static defaultProps = {
        sortData: {}
    }
}

function getSuffix(prefix) {
    return !prefix || prefix == 'default' ? '' : '__' + prefix;
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
