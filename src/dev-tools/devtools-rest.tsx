/// <reference path="../dts/globals.d.ts" />


function restMonitor({ method, url, data, result }) {
    console.groupCollapsed(`Monitor ${method} ${url}`);
    !!data && console.log('REQUEST BODY >>>>', data);
    console.dir(result);
    console.groupEnd();
    return result;
}

OrganicUI.devTools.set('REST|Enable/Disable REST Monitoring', target => {
    const isEnabled = OrganicUI.AppUtils.afterREST == restMonitor;
    OrganicUI.AppUtils.afterREST = isEnabled ? null : restMonitor;
    isEnabled && alert('Monitoring was enabled , it is disabled');
    !isEnabled && alert('✔✔✔ Monitoring was disabled , it is enable  ✔✔✔');


}); 