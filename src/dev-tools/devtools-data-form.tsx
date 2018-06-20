/// <reference path="../organicUI.d.ts" />

const { devTools, JsonInspector } = OrganicUI;

devTools.set('DataForm|Data Inspection', target => {
    target.devElement = <JsonInspector data={target.props.data} />;
    target.forceUpdate();
});