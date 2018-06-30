/// <reference path="organicUI.d.ts" />
import './dev-tools/devtools-data-form';
import './dev-tools/devtools-boxes';
import './dev-tools/devtools-rest';
import { DevFriendlyCommand } from './lib/developer-features';
OrganicUI.devTools.set('Translate', (dev) => {
    OrganicUI.DeveloperBar.topElement = <FabricUI.Dialog onDismiss={() => {
        OrganicUI.DeveloperBar.topElement = null;
        dev.forceUpdate();
    }} isOpen={true} dialogContentProps={{

        title: 'Translate',
        subText: 'detected unlocalized text in below lists'
    }}  >
        <table className="table is-bordered">
            {Object.keys(OrganicUI.i18n.notFounded).map(key => (
                <tr>
                    <td>{key}</td>
                    <td> <FabricUI.TextField /></td>
                </tr>

            ))}
        </table>
    </FabricUI.Dialog>;

    dev.forceUpdate();
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