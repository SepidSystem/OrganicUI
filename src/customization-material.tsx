/// <reference path="./dts/globals.d.ts" />

import { Field } from "./lib/data";
import { Checkbox, TextField, FormControlLabel } from "./lib/inspired-components";


Checkbox['field-className'] = 'reversed-label no-material gray-color check-field';
Checkbox['dataType'] = 'boolean';
Checkbox['textReader'] = function (field: Field, props: any, value) {
    return <FormControlLabel label={null} disabled control={<Checkbox defaultChecked={value} value={value} />} />;
}
TextField['field-className'] = '';

