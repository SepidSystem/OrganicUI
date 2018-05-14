const puppeteer = require('puppeteer');

const url = [];
const trackedUrls = {};
const urlStacks = [];
async function browserProcess(mode, urls) {
    const capturedUrl = [];
    let result;
    const { Core } = window;
    while (urls.length) {
        const url = urls.shift();
        navigator.pushState(null, null, url);
        const { errorCount } = Core.BaseView.Instance;
        if (mode == 'i18n')
            if (mode == 'test')
        
    }
    return { capturedUrl, result };
}
const routedHeadlessApi = {
    '/api/headless/accquire': v => 0,
    '/api/headless/i18n': v => 0,
    '/api/headless/test': v => 0,
    '/api/headless/capture': v => 0,

}
const loadUrls = () => Promise.resolve([]);
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const surf = async (surfMode, pageCount) => {
    const browser = await puppeteer.launch();
    browser.userAgent += '|HEADLESS|'+surfMode;
    urlStacks.push(...(await loadUrls()));
    Array.from({ length: pageCount }).forEach(() => {
        const page = await browser.newPage();
        page.on('request', e => {
            if (e.requust.method != 'POST') return;
            const url = e.request.url();
            const headlessApiFunc = routedHeadlessApi[url];
            if (!headlessApiFunc) return;
            headlessApiFunc();
        });
    });
    while (urlStacks.length) await delay(10);
    await browser.close();
};

surf();