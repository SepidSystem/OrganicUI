import { route } from "./router";
import { IAppModel } from './models';
import { initializeIcons } from 'office-ui-fabric-react/lib/Icons';
let afterLoadCallback: Function = null;
export const setAfterLoadCallback = (callback: Function) => afterLoadCallback = callback;
export const appData: {
    appModel?: IAppModel
} = {};
export function mountViewToRoot(selector?, url?) {

    const root = document.querySelector(selector || '#root');
    const params = {};

    const viewType: typeof React.Component = route(url || location.pathname, params) || OrganicUI.NotFoundView as any;
    let templ: typeof React.Component & { Template: string } = viewType as any;
    let vdom: any;
    const secondaryValue = route['lastSecondaryValue'];
    secondaryValue && Object.assign(params, secondaryValue);

    templ = OrganicUI.templates(templ.Template || 'default') as any;
    const children = React.createElement(viewType, params, )
    vdom = React.createElement(templ, {}, children);


    root.innerHTML = '';
    ReactDOM.render(vdom, root);


}


function handleResize() {
    OrganicUI.View.Instance.forceUpdate();
}
window.addEventListener('resize', handleResize);
export function renderViewToComplete(url) {
    const selector = '#root2';
    mountViewToRoot(selector, url);
    return new Promise(resolve => {
        const element = document.querySelector(selector);
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
    Object.assign(appData,{appModel});
 
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
                }), 1000)
    afterLoadCallback instanceof Function && afterLoadCallback();
}
