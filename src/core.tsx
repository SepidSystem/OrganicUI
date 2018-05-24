
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as FabricUI from 'office-ui-fabric-react';
export { FabricUI };

import { NotFoundView } from './views/404';
import * as changeCaseObject from 'change-case-object'
import { initializeIcons } from 'office-ui-fabric-react/lib/Icons';
initializeIcons('/assets/fonts/');
export function t(target: Object, path: string) {

    return target[path];
}
export const changeCase: { camelCase: Function, snakeCase: Function, paramCase: Function } = changeCaseObject;

export function wrapChildViews<T>(p: T): T {
    return Object.keys(p).reduce((a, b) => {
        a[b] = function () {
            const func = p[b];
            if (Array.from(arguments).some(arg => arg instanceof Promise))
                return 'waiting...';
            return func instanceof Function && func.apply(this, arguments);
        }
        return a;
    }, {}) as T;
}
export type FuncComponent<P, S> = (p: P, s: S, repatch: (delta, target?) => void) => React.ReactNode;

export function setFunctionalView<S>(path: string, func: (s: S) => React.ReactNode, defaultProps?) {
    class FunctionalView extends BaseComponent<any, S>{
        base: any;
        linkState: any;
        constructor(props, s) {
            super(props);
            Object.assign(this, { state: {} });
            Object.assign(this.state, props, { props });

        }
        orginRender(s, repatch) {
            return null;
        }
        render() {
            return this.orginRender && this.orginRender(this.state, (delta, target) => this.repatch(delta, target));
        }
    }
    FunctionalView.prototype.orginRender = func;
    routeTable.set(path, FunctionalView);
}

export function funcAsComponentClass<P, S>(func, defaultProps?) {
    class ReactClass extends BaseComponent<P, S>{
        base: any;
        linkState: any;
        constructor(p, s) {
            super(p);

            Object.assign(this, { state: {} });
        }
        orginRender(p, s, repatch) {
            return null;
        }

        render() {
            return this.orginRender && this.orginRender(this.props, this.state, (delta, target) => this.repatch(delta, target));
            /*return React.cloneElement(result, Object.assign({}, result.props, {
                ref: root => Object.assign(this.state, { root })

            }));*/
        }
    }
    ReactClass.prototype.orginRender = func;

    return ReactClass;
}
export function registryFactory<T>(mapper?: (result: T, key: string) => T) {
    let data = {}, notFounded = {}, secondaryValues = {};
    function getter(key, setValue?: T): T {
        if (arguments.length == 2) return set(key, setValue) as any;
        let result = (data[key]) as T;
        if (key instanceof Object) return key;

        if (key && result === undefined && !notFounded[key]) {
            console.warn('registry not found', key);
            notFounded[key] = 1;
        }
        mapper && (result = mapper.apply(getter, [result, key]));

        return result;
    }
    function register(delta: { [key: string]: T }) {
        Object.assign(data, delta);
    }
    function set(key: string, value: T, extraValue?) {
        let data = {};
        data[key] = value;
        extraValue !== undefined && (secondaryValues[key] = extraValue);
        register(data);
    }
    function directGet(key: string) {
        return this.data[key] || key;
    }
    return Object.assign(getter, { get: directGet, register, data, set, notFounded, secondaryValues });

}
export function setIconAndText(code: string, iconCode: string, text?: string) {
    icon.set(code, iconCode);
    text && i18n.set(code, text);
}
export function mountViewToRoot(selector?, url?) {

    const root = document.querySelector(selector || '#root');
    const params = {};
    const viewType: typeof React.Component = route(url || location.pathname, params) || NotFoundView as any;
    let templ: typeof React.Component & { Template: string } = viewType as any;
    let vdom: any;
    const secondaryValue = route['lastSecondaryValue'];
    secondaryValue && Object.assign(params, secondaryValue);

    if (!templ.Template) {
        templ = templates('base') as any;
        const children = React.createElement(viewType, params, )
        vdom = React.createElement(templ, {}, children);


    }
    else {
        while (templ.Template) {
            templ = templates(templ.Template) as any;
            if (!templ) {
                console.error(`template "${templ.Template}"   not found`);
                return;
            }
            Object.assign(viewType.prototype, templ.prototype);

        }

        vdom = React.createElement(viewType, params) as any;
    }
    root.innerHTML = '';
    ReactDOM.render(vdom, root);

    for (let key in viewType.prototype) {
        const method = viewType.prototype[key] as Function;
        if (method instanceof Function)
            Core.View.Instance[key] = method.bind(Core.View.Instance);
    }
}


function handleResize() {
    Core.View.Instance.forceUpdate();
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
export function startApp() {
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
                }), 100)

}

const routes = [];
export function route(path: string, args: Object): typeof React.Component {
    const match = (route: string) => {
        let pattern = route;
        const parameters = [];

        while (/[:]([a-zA-Z0-9]+)/.test(pattern)) {
            pattern = pattern.replace(/[:]([a-zA-Z0-9]+)/, s => (parameters.push(s.substr(1)), '([^/]+)'))
        }
        path.split('/').filter(c => c.includes(':')).forEach(c => {
            const [key, value] = c.split(':');
            if (args[key] instanceof Array)
                args[key].push(value);
            else if (args[key])
                args[key] = [args[key], value];
            else
                args[key] = value;
        });
        const regExpr = new RegExp('^' + pattern + '$');
        const m = path.split('/').filter(c => !c.includes(':')).join('/').match(regExpr);
        if (m) {

            for (let idx = 1; idx < m.length; idx++) {
                const paramName = parameters.shift();

                const value = m[idx];
                if (paramName in args) {

                    args[paramName] = args[paramName] instanceof Array ? args[paramName].concat([value]) : [args[paramName], value];
                }
                else
                    args[paramName] = value;

            }
            return true;
        }
        return null;
    }

    const matchedRoutes = Object.keys(routeTable.data).filter(match);

    const lastSecondaryValue = matchedRoutes.map(key => routeTable.secondaryValues[key])[0]
    Object.assign(route, { lastSecondaryValue });
    if (matchedRoutes.length == 1) return matchedRoutes.map(routeTable)[0];
    console.warn({ matchedRoutes });
}
Object.assign(route, { lastSecondaryValue: null });
export const i18n = registryFactory<React.ReactNode>((registeredText, key) => (registeredText = registeredText || key, <span title={key} className="i18n" >{registeredText}</span>));
export const extraSheets = registryFactory<() => React.ReactNode>();
export const icon = registryFactory<any>((registeredIcon, key) => (registeredIcon = registeredIcon || 'mi-gesture', <span className="icon"><i title={key} className={[registeredIcon.split('-')[0], registeredIcon].join(' ')} /></span>));
export const templates = registryFactory<typeof React.Component>();
export const fields = registryFactory<typeof React.Component>();
export const menuBar = registryFactory<string | Function>((result: any, key) => result instanceof Function ? result(key) : result);
export const routeTable = registryFactory<any>();
export const showIconText = textId => (<span className="icon-with-text">
    {icon(textId)}
    <span className="text">{i18n(textId)}</span>
</span>);

export const showIconAndText = textId => (<span className="icon-with-text">
    {icon(textId)}
    <span className="text">{i18n(textId)}</span>

</span>);

import * as UtilsMod from './lib/utils';
export { remoteApiProxy, remoteApi } from './lib/action-manager';
export const Utils = UtilsMod;
export function isDevMode() {
    return !!localStorage.getItem('dev-mode') && document.documentElement.classList.contains('dev-mode');
}
export function enableDevMode({ remove } = { remove: false }) {
    remove ? localStorage.removeItem('dev-mode') : localStorage.setItem('dev-mode', new Date().toISOString());
}

export let currentView: any
export interface INotifyItem {
    icon: string;
    content: React.ReactNode;
}
export const notifyItems = [];
export function dialogBox<P>(renderFunc: (p: P) => React.ReactNode): {
    show: (p?: P) => Promise<P>, F
    close: () => void
} {
    return null;
}
export interface ILogicProps {
    name: string, onExecute: Function
}
export function Logic(p: ILogicProps) {
    return <span className="logic" style={{ display: 'none' }}></span>
}
export class BaseComponent<P, S> extends React.Component<P, S>{
    base: any;
    linkState: any;
    state: S;
    refs: any;
    stateListener: IStateListener[];
    constructor(props: P) {
        super(props);
        this.repatch = this.repatch.bind(this);
        this.state = {} as any;
        this.stateListener = React.Children.toArray(this.props.children || [])
            .filter((r: React.ReactElement<any>) => r.type == StateListener)
            .map(child => (child as any).props);


    }
    componentDidMount() {
        const { root } = this.refs;
        root && Object.assign(root, { vdom: this });

    }
    repatch(delta: Partial<S>, target?) {
        target = target || this.state;
        Object.assign(target, delta);
        const keys = Object.keys(delta);
        for (var key in keys) {
            const matchedStateListeners = this.stateListener.filter(sl => sl.target == key);
            matchedStateListeners.forEach(sl => sl.onChange(delta[sl.target]));
        }
        this.forceUpdate();
    }

}
export const dialogArray: ((resolve?, reject?) => React.ReactNode)[] = [];
export function dialog(componentClass: (resolve?, reject?) => React.ReactNode) {
    dialogArray.push(componentClass);
}
export { PureComponent, Component,createElement,cloneElement } from 'react';
export { Template, ViewLogic, Action } from './lib/decorators';

export function Spinner(p: { title?: any }) {
    return <div className="loading-element  spinner is-vcentered">
        <span className=" is-text   button is-loading" style={{ padding: "0", width: "100%" }}></span>
        <div className="column">{p.title}</div>
    </div>
}
interface IStateListener { target: string, onChange: Function };
export function StateListener(p: IStateListener) {

    return (<span style={{ display: "none" }} data-target={p.target} >

    </span>);
}
 