/// <reference path="../dts/organic-ui.d.ts" />
import { IStateListener, StateListener } from "./state-listener";
import ErrorIcon from '@material-ui/icons/Warning';
import { Component } from 'react';
import { createMayBeObject } from './may-be';
import { IComponentRefer } from "@organic-ui";
import { isDevelopmentEnv } from "./developer-features";
export class BaseComponent<P, S> extends Component<P, S>{
    static refIdCounter = 0;

    devElement: any;
    refId: number;
    nodes: any;
    renderContent(): any {
        throw new Error("Method not implemented.");
    }

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
    evaluate<T>(args: string | { refId?, defaultValue? }, cb: (ref: T) => any) {
        if(typeof args=='string') args={refId:args};
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
        root && Object.assign(root, { vdom: this, componentRef: this });

    }
    repatch(delta: Partial<S>  , target?) {
        if(delta['debug'] && !OrganicUI.isProdMode()) debugger;
        if (window['repatchDebug']) debugger;
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
}
export function CriticalContent(p: { permissionKey: string, children?}) {

    return <div className={"critical-content"} data-key={p.permissionKey}>{p.children}</div>
}
const nodeRefTick = (target: BaseComponent<any, any>, refName) => {
    const result = target.refs[refName];
    if (result) return;
    if (target.tryCountLimits[refName]--) {
        console.warn('nodeRefTick issue>>>', target, refName);

    }
    target.repatch({});
    setTimeout(nodeRefTick, 20, target, refName);

}
