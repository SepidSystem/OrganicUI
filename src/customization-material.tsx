/// <reference path="./dts/globals.d.ts" />

import { Field } from "./lib/data";


MaterialUI.Checkbox['field-className'] = 'reversed-label no-material gray-color check-field';
MaterialUI.Checkbox['dataType'] = 'boolean';
MaterialUI.TextField['field-className'] = '';
MaterialUI.Checkbox['textReader'] = function (field: Field, props: any, value) {
    return <MaterialUI.FormControlLabel label={null} disabled control={<MaterialUI.Checkbox defaultChecked={value} value={value} />} />;
}

