import './dev-tools/devtools-data-form';
import './dev-tools/devtools-boxes';

document.addEventListener('keydown', e => {
    if (e.key == 'F1') {
       
        e.preventDefault();
        OrganicUI.DevFriendlyPort.developerFriendlyEnabled =
            !OrganicUI.DevFriendlyPort.developerFriendlyEnabled;
        const componentRefs =
            Array.from(document.querySelectorAll('.developer-port,.developer-bar'))
                .map(ele => ele['componentRef'] as React.Component<any>)
                .filter(ele => !!ele);
 
        componentRefs.forEach(item => item.forceUpdate());
    }
}
);