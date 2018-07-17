/// <reference path="../dts/organic-ui.d.ts" />
import { IStateListener, StateListener } from "./state-listener";
import ErrorIcon from '@material-ui/icons/Warning';
import { Component } from 'react';
import { createMayBeObject } from './may-be';
import { IComponentRefer } from "@organic-ui";
import { isDevelopmentEnv } from "./developer-features";
import { Utils } from "./utils";
export class BaseComponent<P, S> extends Component<P, S>{
    static refIdCounter = 0;
    issues: { [key: string]: Date };
    _autoUpdateState: S;
    devElement: any;
    refId: number;
    nodes: any;
    autoUpdateTimer: number;
    renderContent(): any {
        throw new Error("Method not implemented.");
    }
    processAutoUpdateState() {
        
        if (this.autoUpdateTimer && Object.keys(this.autoUpdateState).length==0) {
            clearInterval(this.autoUpdateTimer);
        }
        const newState = Object.keys(this.autoUpdateState).map(key => {
            const method = this.autoUpdateState[key];
            try {
                const result = method(key);
                if (result instanceof Promise) {
                    (result as Promise<any>).then(r => {
                        Object.assign(this._autoUpdateState, { [key]: r });
                        setTimeout(() => this.repatch({ [key]: r } as any), 1);
                        return r;
                    });
                    delete this.autoUpdateState[key];
                    return null;
                }
                return [key, result];

            } catch{
                return null;
            }
        }).filter(x => !!x).filter(([key, value]) => this._autoUpdateState[key] !== value);
 
        if (newState.length) {
            this._autoUpdateState = Object.assign({}, this.state || {}) as S;
            this.repatch(Utils.reduceEntriesToObject(newState) as S);
        }

    }
    componentWillMount() {
        if (this.autoUpdateState) {
            this._autoUpdateState = Object.assign({}, this.state || {}) as S;
            this.processAutoUpdateState();
            this.autoUpdateTimer = setInterval(this.processAutoUpdateState.bind(this), 100);
        }
    }
    base: any;
    linkState: any;
    state: S;
    refs: any;
    stateListener: IStateListener[];
    autoUpdateState: OrganicUi.PartialFunction<S>;
    constructor(props: P) {
        super(props);
        this.repatch = this.repatch.bind(this);
        this.state = {} as any;
        this.issues = {} as any;
        this.stateListener = React.Children.toArray(this.props.children || [])
            .filter((r: React.ReactElement<any>) => r.type == StateListener)
            .map(child => (child as any).props);
        const refId = ++BaseComponent.refIdCounter;
        Object.assign(this.state, { refId });
        this.tryCountLimits = {};

    }
    tryCountLimits: { [key: string]: number };

    nodeByRef<T = any>(refName: string): T {
        const result = this.refs[refName];
        this.tryCountLimits[refName] = this.tryCountLimits[refName] === undefined ? 5 :
            this.tryCountLimits[refName];
        if (result)
            delete this.tryCountLimits[refName];
        else setTimeout(nodeRefTick, 10, this, refName);
        return createMayBeObject(result);
    }
    evaluate<T>(args: string | { refId?, defaultValue?}, cb: (ref: T) => any) {
        if (typeof args == 'string') args = { refId: args };
        const ref = this.nodeByRef<T>(args.refId);
        try {
            const finalResult = ref && cb(ref);
            return finalResult || args.defaultValue;
        }
        catch (exc) {
            return args.defaultValue;
        }
    }
    componentDidMount() {
        const { root } = this.refs;
        root && Object.assign(root, { componentRef: this });
    }
    defaultState(delta: Partial<S>) {
        Utils.assignDefaultValues(this.state, delta);
    }
    repatch(delta: Partial<S>, target?) {
        if (!OrganicUI.isProdMode()) {
            if (delta['debug']) debugger;
            if (window['repatchDebug'] && !OrganicUI.isProdMode()) debugger;
        }
        target = target || this.state;
        Object.assign(target, delta);
        const keys = Object.keys(delta);
        if (this.stateListener && this.stateListener.length) {
            for (var key in keys) {
                const matchedStateListeners = this.stateListener.filter(sl => sl.target == key);
                matchedStateListeners.forEach(sl => sl.onChange(delta[sl.target]));
            }
        }
        this.forceUpdate();
    }
    querySelectorAll<T=any>(cssSelector: string, target?: HTMLElement): T[] {
        const { root } = this.refs;
        console.assert(!!root, `root is null@queryAllComponentRefs with ${cssSelector}`);
        return (Array.from(((target || root) as HTMLElement).querySelectorAll(cssSelector)))
            .filter((item: any) => (item as IComponentRefer<T>).componentRef)
            .map((item: any) => (item as IComponentRefer<T>).componentRef as any)
    }
    isRootRender() {
        const { root } = this.refs as { root: HTMLElement };
        let parent = root;
        while (parent) {
            if (parent.id == 'root') break;
            parent = parent.parentElement;

        }
        return !!parent;
    }
    setPageTitle(title) {
        let counter = 0;
        function applyPageTitle() {
            const { root } = this.refs as { root: HTMLElement };

            if (!root && counter++ < 10) {
                setTimeout(applyPageTitle.bind(this), 20);
                return;
            }
            let parent = root;
            while (parent) {
                if (parent.id == 'root') break;
                parent = parent.parentElement;
            }
            root.setAttribute('data-page-title', title);
            root.classList.add('page-title-value');
            this.pageTitle = title;
            if (!!parent)
                document.title = title;
        }
        applyPageTitle.apply(this);

    }
    render() {
        if (this.refs.root && !this.refs.root['componentRef'])

            setTimeout(() => this.componentDidMount(), 100);
        if (this.devElement) {
            return <div ref="root" className="developer-features">
                {this.devElement}
            </div>
        }
        return this.renderContent();
    }
    renderErrorMode(title, subtitle) {
        return (<section className="error-mode hero is-danger is-centered" dir="ltr" ref="root">
            <div className="hero-body" dir="ltr">
                <div className="container" dir="ltr">
                    <p className="title" dir="ltr">
                        {<ErrorIcon />}
                        {title}
                    </p>
                    <p className="subtitle" dir="ltr">
                        {subtitle}
                    </p>
                </div>
            </div>
        </section>);
    }
    componentWillUnmount() {
        this.autoUpdateTimer && clearTimeout(this.autoUpdateTimer);
        this.autoUpdateTimer = 0;
    }
}
export function CriticalContent(p: { permissionKey: string, children?}) {

    return <div className={"critical-content"} data-key={p.permissionKey}>{p.children}</div>
}
const nodeRefTick = (target: BaseComponent<any, any>, refName) => {
    const result = target.refs[refName];
    if (result) return;
    if (target.tryCountLimits[refName])
        target.tryCountLimits[refName]--;
    else {
        const lastEcho = +(target.issues[refName] || 0);
        const now = +new Date();
        if (!lastEcho || (now - lastEcho > 2500)) {
            console.warn('nodeRefTick issue>>>', target, refName);
            target.issues[refName] = new Date();
        }
    }


    target.repatch({});
    setTimeout(nodeRefTick, 20, target, refName);

}
