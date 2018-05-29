const { devTools, JsonInspector } = OrganicUI;

devTools.set('DataForm|Data Inspection', (target, devPort) => {
    console.log('DataForm.Data >>>>> ', target.props.data);
    devPort.devElement = <JsonInspector data={target.props.data} />;
    setTimeout(() => devPort.setState({}), 100);
});