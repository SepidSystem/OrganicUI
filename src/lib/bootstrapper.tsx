import { route, routeTable } from "./router";
import { IAppModel } from './models';
import { initializeIcons } from 'office-ui-fabric-react/lib/Icons';
import { i18n } from "./shared-vars";

import { Utils } from "./utils";
let afterLoadCallback: Function = null;
export const setAfterLoadCallback = (callback: Function) => afterLoadCallback = callback;
export const appData: {
    appModel?: IAppModel
} = {};
export function mountViewToRoot(selector?, url?) {
    selector = selector || '#root';
    const root = typeof selector == 'string' ? document.querySelector(selector) : selector as HTMLElement;
    const params = {};

    const viewType: typeof React.Component = route(url || location.pathname, params) || OrganicUI.NotFoundView as any;
    let templ: typeof React.Component & { Template: string } = viewType as any;
    let vdom: any;
    const secondaryValue = route['lastSecondaryValue'];
    secondaryValue && Object.assign(params, secondaryValue);

    templ = OrganicUI.templates(templ.Template || 'default') as any;
    const children = React.createElement(viewType, params, )
    vdom = React.createElement(templ, {}, children);
    if (root.childElementCount)
        ReactDOM.unmountComponentAtNode(root);
    ReactDOM.render(vdom, root);


}



export function renderViewToComplete(url, selector: any = '#root2') {
    mountViewToRoot(selector, url);
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
export function startApp(appModel: IAppModel) {
    initializeIcons('/assets/fonts/');
    Object.assign(appData, { appModel });

    mountViewToRoot();
    window.onpopstate = () => mountViewToRoot();
    setInterval(
        () =>
            Array.from(

                document.querySelectorAll('a.nav:not(.applied-nav)'))
                .filter(an => !an.classList.contains('applied-nav'))
                .forEach(anchor => {
                    anchor.classList.add('applied-nav');
                    anchor.addEventListener('click',
                        e => {
                            e.preventDefault();
                            history.pushState(null, null, (anchor as HTMLAnchorElement).href);
                            mountViewToRoot()
                        });
                }), 300)
    afterLoadCallback instanceof Function && afterLoadCallback();
}
export function scanAllPermission(table: { data }): Promise<ITreeListNode[]> {
    if (Utils['getAllPermission']) {

        return Promise.resolve([]);
    }
    Utils['getAllPermission'] = +new Date();
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
                    Utils['getAllPermission'] = 0;

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