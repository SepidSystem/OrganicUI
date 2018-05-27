const { devTools, JsonInspector } = OrganicUI;

devTools.set('DataForm|Data Inspection', (target, devPort) => {
    devPort.devElement = <JsonInspector data={target.props.data} />;
    setTimeout(() => devPort.setState({}), 100);
});