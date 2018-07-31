import { BaseComponent } from "./base-component";
import { Utils } from "./utils";
import { routeTable } from "./router";
const proxyHandler: ProxyHandler<BaseComponent<any, any>> = {
    get: (target, key) => target.state[key],
    set: (target, key, value) => (!Utils.equals(target[key], value) && target.repatch({ [key]: value })) as any
}
export function StatefulView<S>() {
    class StatefulComponent extends BaseComponent<any, S>{
        private static _watchedStates = [];
        private static _actions = [];
        private static helpers = [];
        private static renderFunc;
        devPortId: any;
        proxiedState: S;
        constructor(p) {
            super(p);
            this.devPortId = Utils.accquireDevPortId();
            this.autoUpdateState =
                StatefulComponent._watchedStates.reduce(({ stateId, callback }) => Object.assign({ [stateId]: callback }, {}))
            this.proxiedState = (new Proxy(this, proxyHandler) as any) as S;
            this.exec = this.exec.bind(this);
        }
        private static getMonitor(): Function {
            return !!OrganicUI.DeveloperBar.developerFriendlyEnabled && StatefulComponent['monitor'];
        }
        static renderer(renderFunc){
            StatefulComponent.renderFunc = renderFunc;
        }
        async exec(actionName: string, actionParams) {
            const monitor = StatefulComponent.getMonitor();
            const actionFunc = StatefulComponent._actions.filter(({ actionId }) => actionId == actionName)[0];
            try {
                if (!actionFunc) throw `action "${actionName}" not found`;
                const result = actionFunc.apply(this, [this, actionParams]);
                const monitorResult = await Utils.toPromise((monitor instanceof Function) && monitor('execute-action', actionName, actionParams, result));
                console.assert(monitorResult != -100, 'optimization can be evil');
                return result;

            } catch (error) {
                const monitorResult = await Utils.toPromise((monitor instanceof Function) && monitor('fail-action', actionName, actionParams, error));
                console.assert(monitorResult != -100, 'optimization can be evil');
                return Promise.reject(error);
            }


        }
        subrender(id, params) {

        }
        renderContent() {
            const renderParams: OrganicUi.IStatefulRenderer<S> = {
                props: this.props,
                state: this.proxiedState,
                repatch: this.repatch.bind(this),
                exec: this.exec,
                subrender: this.subrender.bind(this)
            };
            return <div className="developer-features stateful-view">
                {StatefulComponent.renderFunc(renderParams)}
            </div>
        }
        getDevButton() {
            return Utils.renderDevButton("StatefulView", this);
        }
        static defineWatcher(stateId: keyof S, callback: (view: BaseComponent<any, S>) => any) {
            StatefulComponent._watchedStates.push({ stateId, callback });
            return StatefulComponent;
        }
        static defineAction(actionId: string, callback) {
            StatefulComponent._actions.push({ actionId, callback });
            return StatefulComponent;
        }
        static useHelper(helper) {
            StatefulComponent.helpers.push(helper);
        }
        static assignToRouteTable(pattern: string) {
            routeTable(pattern, StatefulComponent);
        }

    }
    return StatefulComponent;

}
