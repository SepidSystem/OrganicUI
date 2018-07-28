import { Utils, JsonInspector } from "@organic-ui";

OrganicUI.devTools.set('SingleView|Actions', target => {
    target.devElement = (<section className="dev-sheet">
        <h2 className="title is-5">Action for Create</h2>

        <h2 className="title is-5">Action for Read</h2>
        <h2 className="title is-5">Action for Update</h2>
        <h2 className="title is-5">Action for Delete</h2>
    </section>);
    setTimeout(() => target.forceUpdate(), 100);
});
const methods = {
    afterSave(data, id, actions?: OrganicUi.IActionsForCRUD<any>) {
        return actions.read(id).then(loadedData => {
            let patchedData = Utils.diff(loadedData, data);
            if (!patchedData || Object.keys(patchedData).length == 0) return Promise.resolve(true);

            return new Promise(resolve => OrganicUI.AppUtils.showDialog(<section className='self-test-fail'>
                <div className="title is-centered"> self-test fail</div>
                <div className="columns" style={{ minWidth: '600px' }}>
                    <div className="column is-half">
                        <div className="title is-centered is-4">Local Version</div>
                        <JsonInspector data={data} /></div>
                    <div className="column is-half">
                        <div className="title is-centered is-4">Remote Version</div>
                        <JsonInspector data={loadedData} /></div>

                </div>
                <code style={{ background: '#999', direction: 'ltr', textAlign: 'left', display: 'block' }}>
                    {JSON.stringify(patchedData, null, 4)}
                </code><hr />
                <div className="primary-actions">
                    <OrganicUI.AdvButton variant="raised" color="primary" fullWidth
                        onClick={() => {
                            OrganicUI.AppUtils.showDialog(null);

                            setTimeout(() => resolve(), 10);
                        }}
                    >
                        <span className="animated tada">
                            Proceed
                    </span></OrganicUI.AdvButton>
                </div>
            </section>, { noClose: true }));
        });

    }
}
function monitor(actionName: string, data, id, actions?: OrganicUi.IActionsForCRUD<any>) {
    const method = methods[actionName];
    if (method) return method(data, id, actions);
    return new Promise(resolve => OrganicUI.AppUtils.showDialog(<section>
        <div className="title is-centered">{actionName}</div>
        <OrganicUI.JsonInspector isExpanded={() => true} data={data} />
        <div className="primary-actions">
            <OrganicUI.AdvButton variant="raised" color="primary" fullWidth
                onClick={() => {
                    OrganicUI.AppUtils.showDialog(null);

                    setTimeout(() => resolve(data), 10);
                }}
            >
                <span className="animated tada">
                    Proceed
                </span></OrganicUI.AdvButton>
        </div>
    </section>, { noClose: true }));
}
OrganicUI.devTools.set('SingleView|Enable/Disable Monitoring', target => {

    const monitorFunc = !!OrganicUI.SingleViewBox['monitorFunc'] ? null : monitor;
    localStorage.setItem('SingleView-Monitoring', !!monitorFunc ? '1' : '');
    alert(!monitorFunc ? 'single-view monitoring is dsiabled' : '✔✔✔ single-view monitoring was disabled , it is enabled ✔✔✔')
    Object.assign(OrganicUI.SingleViewBox, { monitorFunc });

});
OrganicUI.devTools.set('SingleView|Logs', target => {
    target.devElement = (<section className="dev-sheet">
        <h2 className="title is-6">Log1</h2>

    </section>);
    setTimeout(() => target.forceUpdate(), 100);
});
OrganicUI.devTools.set('SingleView|Show Undefined Fields', (target) => {

    if (!(target.props && target.props.params && target.props.params.id)) {
        alert('you cannot use this tool in Add Form,please save , then edit');
        return;
    }
    const { undefinedFields } = target as any;
    const fields = Object.keys(undefinedFields).filter(x => x && x != '-');
    console.log('undefined Fields>>>>', fields);
    target.devElement = <OrganicUI.JsonInspector data={fields} />;
    target.forceUpdate();
});
setTimeout(function () {

    if (localStorage.getItem('SingleView-Monitoring') == '1') {
        OrganicUI.SingleViewBox['monitorFunc'] = monitor;
    }
}, 10);
