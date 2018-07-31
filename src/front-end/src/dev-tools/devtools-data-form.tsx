/// <reference path="../dts/globals.d.ts" />

import { devTools, JsonInspector }  from '@organic-ui';

devTools.set('DataForm|Data Inspection', target => {
    target.devElement = <JsonInspector data={target.props.data} />;
    target.forceUpdate();
});