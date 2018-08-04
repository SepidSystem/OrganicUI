import { chainFactoryTable } from "../shared-vars";
import { StatefulView } from "../stateful-view";
import { BaseComponent } from "../base-component";
import { Utils } from "../utils";
import { Spinner } from '../spinner';
function chainFactory<TData, TState=any>(options: OrganicUi.IDashboardWidgetOptions):
    OrganicUi.IDashboardWidgetChain<TData, TState> {
    const chainMethods = ['paramInitializer', 'dataLoader', 'dataRenderer'];
    const AClass = StatefulView({ chainMethods, className: '' });

    AClass.afterConsturct = function () {
        const self = this as BaseComponent<any, any>;
        const param = AClass.applyChain('paramInitializer');
        const loader = Utils.toPromise(AClass.applyChain('dataLoader', param))
            .then(data => self.repatch({ data }));
        Object.assign(this.state, { data: loader, param });
    };
    function getRenderParams(target) {
        const { state } = target;
        const { param, data } = target.state;
        return {
            state,
            param, data,
            repatch: target.repatch.bind(target),
            exec: target.exec.bind(target),
            subrender: target.subrender.bind(target),
            showModal: target.showModal.bind(target)
        };

    }
    AClass.renderer(p => {
        if (p.state.data instanceof Promise) return <Spinner />;

        return AClass.applyChain('dataRenderer', p)
    }
    );
    return Object.assign(AClass, { options, getRenderParams }) as any;
}
chainFactoryTable('frontend:dashboard:block', chainFactory);