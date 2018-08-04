import { BaseComponent } from "./base-component";
import { Utils } from "./utils";
import { AppUtils } from './app-utils';
import { routeTable } from "./router";
import { chainFactoryTable } from "./shared-vars";
const proxyHandler: ProxyHandler<BaseComponent<any, any>> = {
    get: (target, key) => target.state[key],
    set: (target, key, value) => (!Utils.equals(target[key], value) && target.repatch({ [key]: value })) as any
}
export function StatefulView<S>({ chainMethods, className }) {
    class StatefulComponent extends BaseComponent<any, S>{
        private static _watchedStates = [];
        static _hooks = {};
        private static renderFunc;
        private static className = className;
        static afterConsturct: Function;
        devPortId: any;
        proxiedState: S;
        constructor(p) {
            super(p);
            this.devPortId = Utils.accquireDevPortId();
            this.autoUpdateState =
                StatefulComponent._watchedStates.reduce((a, { stateId, callback }) => Object.assign(a, { [stateId]: callback }), {})
            this.proxiedState = (new Proxy(this, proxyHandler) as any) as S;
            if (StatefulComponent.afterConsturct instanceof Function)
                StatefulComponent.afterConsturct.apply(this, [p]);
        }
        static queryChains(callerName: string, callbackFn: Function, ...args) {
            const items = Array.from(StatefulComponent[`_${callerName}Array`] || []) as Function[];
            return items.map(item => callbackFn(item, ...args));
        }
        static applyChains(callerName: string, ...args) {
            return StatefulComponent.queryChain(callerName, (method, ...array) => method(...array), ...args);
        }
        static queryChain(callerName: string, callbackFn: Function, ...args) {
            const items = Array.from(StatefulComponent[`_${callerName}Array`] || []) as Function[];
            console.assert(items.length < 2, `queryChain fail for ${callerName}`);
            return callbackFn(items[0], ...args);
        }

        static applyChain(callerName: string, ...args) {
            return StatefulComponent.queryChain(callerName, (method, ...array) => method(...array), ...args);
        }
        private static getHookMonitor(): Function {
            return !!OrganicUI.DeveloperBar.developerFriendlyEnabled && StatefulComponent['hookMonitor'];
        }
        callHook(hookName, ...args) {
            const { method } = (StatefulComponent._hooks[hookName] || {}) as any;
            if (method instanceof Function)
                return method.apply(this, args);
        }
        hook(type: string, hookName: string, method: Function) {
            StatefulComponent._hooks[hookName] = ({ type, hookName, method });
        }
        static renderer(renderFunc) {
            StatefulComponent.renderFunc = renderFunc;
            return StatefulComponent;
        }
        showModal(hookName, ...args) {
            const result = this.callHook(hookName, ...args);
            if (result)
                return AppUtils.showDialog(result)
        }
        runAction(hookName, ...args) {
            const result = this.callHook(hookName, ...args);
            if (result instanceof Promise)
                return result;
            else
                throw `runAction ${hookName}, result is not promise`;
        }
        subrender(hookName, ...params) {
            const content = this.callHook(hookName, ...params);
            if (content && !React.isValidElement(content))
                throw `invalid subrender"${hookName}" `;
            return content;
        }
        static getRenderParams(target: StatefulComponent): any {
            return {
                props: target.props,
                state: target.proxiedState,
                repatch: target.repatch.bind(this),
                runAction: target.runAction.bind(this),
                subrender: target.subrender.bind(this),
                showModal: target.showModal.bind(this)
            };
        }
        renderContent() {
            const { renderFunc, getRenderParams } = StatefulComponent;
            try {
                const content = renderFunc.apply(this, [getRenderParams(this)]);
                return <div className={Utils.classNames("developer-features", StatefulComponent.className)} ref="root">
                    {content}
                </div>
            }
            catch (exc) {
                return this.renderErrorMode(`problem in renderMode`, exc.toString());
            }
        }

        getDevButton() {
            return Utils.renderDevButton({ prefix: "ChainView", targetText: <i className="fa fa-info" /> }, this);
        }
        done() {

        }
        static watcher(stateId: keyof S, callback: (view: BaseComponent<any, S>) => any) {
            StatefulComponent._watchedStates.push({ stateId, callback });
            return StatefulComponent;
        }
         

        static assignRoute(pattern: string) {
            routeTable(pattern, StatefulComponent);
        }
    }
    Array.from(chainMethods || [])
        .forEach(key => {
            StatefulComponent[`_${key}Array`] = [];
            StatefulComponent[`${key}`] =
                (...args) => (StatefulComponent[`_${key}Arrayّ`].push(args.length == 1 ? args[0] : args), StatefulComponent);


        });

    return StatefulComponent;
}

chainFactoryTable('frontend', function () {
    return StatefulView({ className: 'frontend', chainMethods: [] });
});
