/// <reference path="./dts/globals.d.ts" />
import './dev-tools/devtools-data-form';
import './dev-tools/devtools-list-view-box';
import './dev-tools/devtools-single-view-box';
import './dev-tools/devtools-rest';
import './dev-tools/devtools-reinvent';

import { TextField } from './lib/inspired-components';
import { IComponentRefer, IDeveloperFeatures, AppUtils, DataForm, Field } from '@organic-ui';
OrganicUI.devTools.set('Translate', (dev) => {
    AppUtils.showDataDialog(<DataForm>
        {Object.keys(OrganicUI.i18n.notFounded).map(key => (
            <Field label={key} accessor={`__translate__${key}`}> <TextField /></Field>

        ))}

    </DataForm>)
        .then(data => Object.keys(data).reduce((a, key) => Object.assign(a, { [key.replace('__translate__', '')]: data[key] }, {})))
        .then(data => console.log(data));

});
OrganicUI.devTools.set('Reset All Dev Tools', () => {
    Array.from(document.querySelectorAll('.developer-features'))
        .map((dv: any) => (dv as IComponentRefer<IDeveloperFeatures>).componentRef)
        .filter(dv => dv && dv.devElement).forEach(dv => {
            dv.devElement = null;
            const dev = dv as any;
            dev.forceUpdate && dev.forceUpdate();
        });
});
OrganicUI.DeveloperBar.isDevelopmentEnv = true;
document.addEventListener('keydown', e => {
    if (e.key == 'F1') {
        e.preventDefault();
        Array.from(document.querySelectorAll('.dev-target'))
            .forEach(element => element.classList.remove('dev-target'));


        OrganicUI.DeveloperBar.developerFriendlyEnabled =
            !OrganicUI.DeveloperBar.developerFriendlyEnabled;
        const componentRefs =
            Array.from(document.querySelectorAll('.developer-features,.developer-bar'))
                .map((ele: any) => (ele as IComponentRefer<React.Component<any>>).componentRef)
                .filter(ele => !!ele);
        componentRefs.forEach(item => (item['devElement'] = null, item.forceUpdate()));
    }
}
);
console['error'] = () => 0;