import './dev-tools/devtools-data-form';

document.addEventListener('keydown', e => {
    if (e.key == 'F1') {
        e.preventDefault();
        OrganicUI.DevFriendlyPort.developerFriendlyEnabled =
            !OrganicUI.DevFriendlyPort.developerFriendlyEnabled;
        const componentRefs =
            Array.from(document.querySelectorAll('.developer-port'))
                .map(ele => ele['componentRef'] as React.Component<any>)
                .filter(ele => !!ele);
 
        componentRefs.forEach(item => item.forceUpdate());
    }
}
);