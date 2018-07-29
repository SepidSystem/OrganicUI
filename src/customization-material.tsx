/// <reference path="./dts/globals.d.ts" />

import { Field } from "./lib/data";
import { Checkbox, TextField, FormControlLabel } from "./lib/inspired-components";
import { ComboBox } from "./lib/combo-box";
import { Utils } from "./lib/utils";
import { i18n } from "./lib/shared-vars";


Checkbox['field-className'] = 'reversed-label no-material gray-color check-field';
Checkbox['dataType'] = 'boolean';
Checkbox['textReader'] = function (field: Field, props: any, value) {
    return <FormControlLabel label={null} disabled control={<Checkbox defaultChecked={value} value={value} />} />;
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
console.log(Utils.enumToIdNames(CheckBoxStatus));
Checkbox['field-renderMode-filterPanel'] = (p) => (
    <ComboBox
        items={Utils.enumToIdNames(CheckBoxStatus)}
        placeholder={i18n('none') as any}
        onChange={({ target }) => p.onChange(checkBoxStatusToBoolean(target.value))}
        value={toCheckBoxStatus(p.value)} />
)
Checkbox['filterOperators']=['eq','neq'];
Checkbox['field-renderMode-filterPanel']['filterOperators']=Checkbox['filterOperators'];
TextField['field-className'] = ''; 
