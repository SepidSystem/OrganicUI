/// <reference path="../organicUI.d.ts" />


OrganicUI.devTools.set('SingleView|Actions', target => {
    target.devElement = (<section className="dev-sheet">
        <h2 className="title is-5">Action for Create</h2>

        <h2 className="title is-5">Action for Read</h2>
        <h2 className="title is-5">Action for Update</h2>
        <h2 className="title is-5">Action for Delete</h2>
    </section>);
    setTimeout(() => target.forceUpdate(), 100);
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
    const fields = Object.keys(undefinedFields).filter(x=>x && x!='-');
    console.log('undefined Fields>>>>', fields)
    target.devElement = <OrganicUI.JsonInspector data={fields} />;
    target.forceUpdate();
});

OrganicUI.devTools.set('ListView|Show ListData', (target) => {

    const { listData } = target.refs.dataList.state;
    target.devElement = <OrganicUI.JsonInspector data={listData} />;
    target.forceUpdate();
});

