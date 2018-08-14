/// <reference path="./dts/globals.d.ts" />

import { Field } from "./lib/data";
import { Checkbox, TextField, FormControlLabel, Switch, Select } from "./lib/inspired-components";
import { ComboBox } from "./lib/combo-box";
import { Utils } from "./lib/utils";
import { i18n } from "./lib/shared-vars";
import { IFieldProps } from "@organic-ui";



Checkbox['dataType'] = 'boolean';
import * as CheckedImage from '../icons/checked.svg';
import * as ErrorImage from '../icons/error.svg';
Checkbox['textReader'] = function (field: Field, props: any, value) {
    return <div className="checkbox-cell" dangerouslySetInnerHTML={{ __html: value ? CheckedImage : ErrorImage }} />;
    //   return <FormControlLabel label={null} disabled control={<Checkbox defaultChecked={value} value={value} />} />;
} 
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

Checkbox['field-renderMode-filterPanel'] = (fieldProps: IFieldProps) => (p) => (
    <ComboBox
        items={Utils.enumToIdNames(CheckBoxStatus,
            { 'checked': fieldProps.trueDisplayText, 'unchecked': fieldProps.falseDisplayText })}
        placeholder={i18n('none') as any}
        onChange={({ target }) => p.onChange(checkBoxStatusToBoolean(target.value))}
        value={toCheckBoxStatus(p.value)} />
)
Checkbox['filterOperators'] = ['eq', 'neq'];
Checkbox['field-renderMode-filterPanel']['filterOperators'] = Checkbox['filterOperators'];
Checkbox['classNameForField'] = 'checkbox-field';
Checkbox['field-className'] = 'reversed-label no-material  check-field';
TextField['field-className'] = 'textfield-field';
ComboBox['classNameForField'] = 'dropdown-field';
Select['classNameForField'] = 'dropdown-field';
Switch['classNameForField'] = 'switch-field';
