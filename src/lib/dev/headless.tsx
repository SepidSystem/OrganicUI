
/// <reference path="../../core.d.ts" />

import { View } from "../view";
// NOTE :  headlessAPIs are in surf.js(headless-agent) , there are  event driven(IPC) , these API are *not* SERVER-API(Backend)
const headlessAPI = (action: string, body) => fetch(`/api/headless/${action}`, { method: 'POST', body: JSON.stringify(body) });
const delay = ms => new Promise(resolve => setTimeout(resolve,ms));
async function surf(surfMode: string) {
    const handleErrorOccur = url => 0;
    const renderURL = url => 0;
    const prepare_i18nResult = () => 0;
    const prepare_testResult = () => 0;
    while (true) {
        const url = await headlessAPI('accquire', null);
        if (!url) break;
        renderURL(url);
        const { Instance: ViewInstance } = View;
        if (surfMode == 'ur') {
            while (!ViewInstance.loadingCount) {
                if (ViewInstance.errorCount) {
                    handleErrorOccur(url);
                }
                await delay(3);

            }
            if (ViewInstance.errorCount)
                handleErrorOccur(url);
        }
        if (ViewInstance.capturedURLs instanceof Array && ViewInstance.capturedURLs.length) {
            await headlessAPI('capture', { urls: ViewInstance.capturedURLs });
        }
        let preparedBody;
        if (surfMode == 'i18n') preparedBody = prepare_i18nResult();
        else if (surfMode == 'test') preparedBody = prepare_testResult();
        else throw `${surfMode} not defined`;
        headlessAPI(surfMode, preparedBody);

    }
}
if (navigator.userAgent.includes('|HEADLESS|'))
    surf(navigator.userAgent.split('|').slice(-1).join());

