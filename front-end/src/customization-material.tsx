/// <reference path="./dts/globals.d.ts" />

import { Field, FilterItem } from "./lib/data/field";
import { Checkbox, TextField, FormControlLabel, Switch, Select } from "./lib/controls/inspired-components";
import { ComboBox } from "./lib/core/combo-box";
import { Utils } from "./lib/core/utils";
import { i18n } from "./lib/core/shared-vars";
import { IFieldProps } from "@organic-ui";
import * as CheckedImage from '../icons/checked.svg';
import * as ErrorImage from '../icons/error.svg';


enum CheckBoxStatus {
    none = "",
    checked = "1",
    unchecked = "0"
}
function toCheckBoxStatus(val) {

    if (val === null || val === undefined) return CheckBoxStatus.none;
    return val ? "1" : "0";
}
function checkBoxStatusToBoolean(v: CheckBoxStatus) {
    if (v == CheckBoxStatus.none)
        return null;
    return !!parseInt(v);
}
function passFilterItemBool(filterItem:FilterItem){
    return Object.assign(filterItem, { fieldType: 'bool' });
}
[Checkbox, Switch].forEach(Checkbox => {
    Checkbox['dataType'] = 'boolean';
    Checkbox['passFilterItem'] = passFilterItemBool;
    Checkbox['textReader'] = function (field: Field, props: any, value) {
        return <div className="checkbox-cell" dangerouslySetInnerHTML={{
            __html: value ? `<span>
            ${CheckedImage} <span style="display:none">✔<span>
            </span>` : ErrorImage
        }} />;
        //   return <FormControlLabel label={null} disabled control={<Checkbox defaultChecked={value} value={value} />} />;
    }
    Checkbox['field-renderMode-filterPanel'] = (fieldProps: IFieldProps) => {
        const func = (p) => {
            const items = Utils.enumToIdNames(CheckBoxStatus,
                { customCaptions: { 'checked': fieldProps.trueDisplayText, 'unchecked': fieldProps.falseDisplayText } })
            return <ComboBox
                items={items}
                placeholder={i18n('none') as any}
                onChange={({ target }) => p.onChange(checkBoxStatusToBoolean(target.value))}
                value={toCheckBoxStatus(p.value)} />
        }
        func['passFilterItem'] = passFilterItemBool;
        const classNameForField = 'dropdown-field';
        return Object.assign(func, { classNameForField });
    }
    Checkbox['filterOperators'] = ['eq', 'neq'];
    Checkbox['field-renderMode-filterPanel']['filterOperators'] = Checkbox['filterOperators'];
});
Checkbox['classNameForField'] = 'checkbox-field';
Checkbox['field-className'] = 'reversed-label no-material  check-field';
TextField['field-className'] = 'textfield-field';
ComboBox['classNameForField'] = 'dropdown-field';
Select['classNameForField'] = 'dropdown-field';
Switch['classNameForField'] = 'switch-field';
