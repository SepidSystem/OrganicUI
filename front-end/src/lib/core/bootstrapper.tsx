import { route, routeTable } from "./router";

import { initializeIcons } from 'office-ui-fabric-react/lib/Icons';
import { i18n, icon } from "./shared-vars";

import { Utils } from "./utils";
export function loadScript(src, onload?) {
    const script = document.createElement('script');
    Object.assign(script, { src, onload });
    document.head.appendChild(script);
    return script;
}
import { IOptionsForViewBox } from "../box/view-box";
import { IAppModel, ITreeListNode } from "@organic-ui";
import { NotFoundView } from "./404";
import { MuiThemeProvider } from "@material-ui/core/styles";
import theme from '../../styles/theme';
import { openRegistry } from "./registry";
import OrganicBox from "../box/organic-box";
let afterLoadCallback: Function = null;
export const setAfterLoadCallback = (callback: Function) => afterLoadCallback = callback;
export const appData: {
    appModel?: IAppModel

} = {};
interface IMountViewToRootParams {
    selector?;
    url?;
    clearLinks?: boolean;
    callback?: Function;
}
export function mountViewToRoot(p?: IMountViewToRootParams) {
    p = p || {};
    p.selector = p.selector || '#root';
    const root: HTMLElement = typeof p.selector == 'string' ? document.querySelector(p.selector) : p.selector as HTMLElement;
    const params = {};
    let viewType: typeof React.Component = route(p.url || location.pathname, params) || NotFoundView as any;
    if (viewType['classGetter']) viewType = (viewType as Function)(params);

    const secondaryValue = route['lastSecondaryValue'];
    secondaryValue && Object.assign(params, secondaryValue);
    const view = React.createElement(viewType, params);
    const masterPage = (viewType['masterPage']) || appData.appModel.defaultMasterPage();
    const vdom = React.createElement(masterPage, {}, view);;
    if (ReactDOM.unmountComponentAtNode instanceof Function && root.childElementCount)
        ReactDOM.unmountComponentAtNode(root);
    const virtualElement = !!theme ? <MuiThemeProvider theme={theme}>{vdom}</MuiThemeProvider> : vdom;
    ReactDOM.render(virtualElement, root, () => p.callback instanceof Function && p.callback());


}



export function renderViewToComplete(url, selector: any = '#root2') {
    mountViewToRoot({ selector, url, clearLinks: true });
    return new Promise(resolve => {
        const element = typeof selector == 'string' ? document.querySelector(selector) : selector;
        function check() {
            if (!element.querySelector('.loading-element'))
                return resolve(true)
            setTimeout(check, 200);
        }
        check();
    })
}
export const getCurrentUserLangauge = () => localStorage.getItem('lang') || 'FA_IR';
function loadLocalizationResource(userLang?) {
    const scripts = Array.from(document.querySelectorAll('script'));
    const domainScript = scripts.filter(({ src }) => src.includes('/domain.js'))[0];
    userLang = userLang || getCurrentUserLangauge();
    const src = domainScript.src.replace('.js', `-${userLang}.js`);
    return new Promise(resolve => {
        i18n.clear();
        icon.clear();
        loadScript(src, resolve)
    });
}
export function startApp(appModel: IAppModel) {
    initializeIcons('/assets/fonts/');
    Object.assign(appData, { appModel });
    window.onpopstate = () => mountViewToRoot();
    afterLoadCallback instanceof Function && afterLoadCallback();
    loadLocalizationResource().then(() => mountViewToRoot());
}
export const changeUserLanguage = lang => loadLocalizationResource(lang).then(() => mountViewToRoot());
export function scanAllPermission(table: { data }): Promise<ITreeListNode[]> {
    if (Utils['scaningAllPermission']) {

        return Promise.resolve([]);
    }
    Utils['scaningAllPermission'] = +new Date();

    const result: ITreeListNode[] = [];
    let appliedUrls = [];
    const urls = Object.keys(table.data);
    OrganicUI.Utils.setNoWarn(+new Date() as any);
    return new Promise(resolve => {
        urls.forEach(url => {
            const temp = document.createElement('div');
            renderViewToComplete(url, temp).then(() => {
                appliedUrls.push(url);
                if (appliedUrls.length == urls.length) {
                    Utils['scaningAllPermission'] = 0;

                    setTimeout(() => OrganicUI.Utils.setNoWarn(false), 3000);
                    setTimeout(() => resolve(result), 1);
                }
                const criticalArray = Array.from(temp.querySelectorAll('.critical-content'));
                const treeList: ITreeListNode[] =
                    criticalArray.map(ele => ele.getAttribute('data-key'))
                        .map(key => ({ key, text: i18n.get(key), parentKey: url, type: 0 }));
                if (treeList.length) {
                    treeList.unshift({
                        key: url,
                        parentKey: 0,
                        text: Array.from(temp.querySelectorAll('.page-title-value')).map(p => p.getAttribute('data-page-title')).join('')

                            || url,
                        type: 0
                    })
                }
                result.push(...treeList);
            });
        });
    });
}

