import { reinvent } from "./reinvent";
import { Utils } from "../utils";
import { Spinner } from '../spinner';
function classFactory<TData, TState=any>(options: OrganicUi.IDashboardWidgetOptions):
    OrganicUi.IDashboardWidgetReinvent<TData, TState> {
    const chainMethods = ['paramInitializer', 'dataLoader', 'dataRenderer'];
    const AClass = reinvent.baseClassFactory({ chainMethods, className: 'dashboard-widget' });

    AClass.afterConsturct = function () {
        const param = AClass.applyChain('paramInitializer');
        const loader = Utils.toPromise(AClass.applyChain('dataLoader', param))
            .then(data => this.repatch({ data }));
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
reinvent.factoryTable['frontend:dashboard:widget'] = classFactory;