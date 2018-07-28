/// <reference path="../dts/globals.d.ts" />


OrganicUI.devTools.set('ListView|Show Web Request', (target) => {

});
OrganicUI.devTools.set('ListView|Show ListData', (target) => {
    const { listData } = (target.refs.dataList as any).state;
    target.devElement = <OrganicUI.JsonInspector data={listData} />;
    target.forceUpdate();
});

