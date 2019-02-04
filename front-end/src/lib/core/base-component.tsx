/// <reference path="../../dts/organic-ui.d.ts" />
import { IStateListener, StateListener } from "./state-listener";
import { Component } from 'react';
import { IComponentRefer } from "@organic-ui";
import { CoreUtils } from "./core-utils";
import { i18n } from "./shared-vars";

/** BaseComponent for Organic-UI  */
export class BaseComponent<P, S> extends Component<P, S>{
    static refIdCounter = 0;
    issues: { [key: string]: Date };
    _autoUpdateState: S;
    devElement: any;
    nodes: any;
    autoUpdateTimer: any; 
    renderContent(): any {
        throw new Error("Method not implemented.");
    }
    layoutIsComplete() {
        return true;
    }
    /** 
     * 
     */
    processAutoUpdateState() {
        if (this.autoUpdateTimer && Object.keys(this.autoUpdateState).length == 0) {
            clearInterval(this.autoUpdateTimer);
        }
        const newState = Object.keys(this.autoUpdateState).map(key => {
            const method = this.autoUpdateState[key];
            try {
                const result = method instanceof Function && method(key);
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
        }).filter(x => !!x)
            .filter(([key, value]) => {
                if (value === this.state[key]) return false;
                try {
                    return JSON.stringify(value) !== JSON.stringify(this.state[key])
                } catch (xc) { }
                return !(value == this.state[key]);
            });

        if (newState.length) {
            this.repatch(CoreUtils.reduceEntriesToObject(newState) as S);
        }

    }
    static selfBindMethods: string[];
    selfBindMethodsApplied: boolean;
    applySelfBindMethods() {
        const { selfBindMethods } = (this as any).__proto__;
        if (!(selfBindMethods instanceof Array)) return;
        for (const methodName of selfBindMethods)
            this[methodName] = (this[methodName] as Function).bind(this);
    }
    /** initialize autoUpdateState if needed */
    componentWillMount() {
        if (this.autoUpdateState && Object.keys(this.autoUpdateState).length) {
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
    childrenByRole: { [role: string]: any[] }
    /**
     * 
     * @param props react properties
     */
    constructor(props: P) {
        super(props);
        this.forceUpdate = this.forceUpdate.bind(this);
        this.childrenByRole = this.getChildrenByRole((props as any).children);
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
    _getChildrenByRole(accum, child) {
        const role = child.props.role || child.props['data-role'];
        return Object.assign(accum, {
            [role]: (accum[role] || []).concat([child])
        })
    }
    getChildrenByRole(children) {
        return (children instanceof Array ? children
            : React.Children.toArray(children))
            .filter((c: any) => c && c.props && (c.props.role || c.props['data-role']))
            .reduce(this._getChildrenByRole, {});
    } /*  */
    tryCountLimits: { [key: string]: number };


    componentDidMount() {
        const { root } = this.refs;
        root && Object.assign(root, { componentRef: this });

    }
    defaultState(delta: Partial<S>) {
        CoreUtils.assignDefaultValues(this.state, delta);
    }
    asyncRepatch(key: keyof S, asyncFunc: Function, ...args) {
        this.repatch({
            [key]: this.state[key] || asyncFunc(...args).then(result => this.repatch({ [key]: result } as any)
            ) as any
        } as any);
    }
    tryCheckRefs: number;
    checkRefs(...args: string[]): boolean {
        if (this.tryCheckRefs > 5) return;
        this.tryCheckRefs = this.tryCheckRefs || 0;;
        const result = args.reduce((a, key) => a && this.refs[key], true);
        if (!result) this.repatch({}, null, 20);
        return this.refs[args[args.length - 1]];
    }
    evalFromRef<TRef=HTMLElement>(refName: string, callback: (ref: TRef) => any,defaultValue?) {
        try {
            const ref = this.checkRefs(refName) as any;
            return ref && callback(ref);
        } catch{
            return defaultValue;
        }
    }
    repatch(delta: Partial<S>, target?, delay?) {
        if (delay) {
            setTimeout(this.repatch.bind(this), delay, delta, target);
            return;
        }
        if (!OrganicUI.isProdMode()) {
            if (delta && delta['debug']) debugger;
            if (window['repatchDebug'] && !OrganicUI.isProdMode()) debugger;
        }
        target = target || this.state;
        Object.assign(target, delta || {});
        const keys = Object.keys(delta || {});
        if (this.stateListener && this.stateListener.length) {
            for (var key in keys) {
                const matchedStateListeners = this.stateListener.filter(sl => sl.target == key);
                matchedStateListeners.forEach(sl => sl.onChange(delta[sl.target]));
            }
        }
        return new Promise(resolve => this.forceUpdate(() => resolve(delta)));
    }
    querySelectorAll<T=any>(cssSelector: string, target?: HTMLElement): T[] {
        const { root } = this.refs;
        console.assert(!!root, `root is null,@queryAllComponentRefs with ${cssSelector}`);
        if (!(target || root)) return [];
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
            if (root) {
                root.setAttribute('data-page-title', title);
                root.classList.add('page-title-value');
            }
            this.pageTitle = title;
            if (!!parent)
                document.title = i18n.get(title);
        }
        applyPageTitle.apply(this);

    }
    static DefaultOfLayoutCompleteLimit = 10;
    layoutCompleteLimit = BaseComponent.DefaultOfLayoutCompleteLimit;
    componentRefCounter: number = 0;
    render() {
        if (!this.selfBindMethodsApplied) {
            this.selfBindMethodsApplied = true;
            this.applySelfBindMethods();
        }

        if (this.refs.root && (this.componentRefCounter || 0) < 3) {
            setTimeout(() => this.componentDidMount(), 100);
            this.componentRefCounter = (this.componentRefCounter || 0) + 1;
        }
        if (this.devElement) {
            return <div ref="root" className="developer-features">{this.devElement}</div>
        }
        if (!this.layoutIsComplete()) {
            if (this.layoutCompleteLimit-- > 0)
                setTimeout(this.repatch, 20);
            else
                console.warn('layoutIsComplete warn>>>>', this);

        }
        else this.layoutCompleteLimit = BaseComponent.DefaultOfLayoutCompleteLimit;
        return this.renderContent();
    }
    renderErrorMode(title, subtitle?) {
        if (!subtitle)
            return <span className="error-mode" style={{ background: 'red' }}>{title}</span>
        return (<section className="error-mode hero is-danger is-centered" dir="ltr" ref="root">
            <div className="hero-body" dir="ltr">
                <div className="container" dir="ltr">
                    <p className="title" dir="ltr">

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
export function CriticalContent(p: OrganicUi.CriticalContentProps) {
    return <>
        {p.permissionValue && <span className="critical-content" data-value={p.permissionValue.toString()} data-key={p.permissionKey} />}
        {p.children}
    </>
}
