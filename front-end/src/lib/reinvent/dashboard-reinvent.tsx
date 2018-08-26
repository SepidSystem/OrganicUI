import { reinvent } from "./reinvent";
import { Utils } from "../core/utils";
import { Spinner } from '../core/spinner';
function classFactory<TData, TState=any>(options: OrganicUi.IDashboardWidgetOptions):
    OrganicUi.IDashboardWidgetReinvent<TData, TState> {
    const chainMethods = ['paramInitializer', 'dataLoader', 'dataRenderer', 'size'];
    const AClass = reinvent.baseClassFactory({ chainMethods, className: 'dashboard-widget' });
    const reactClass: typeof React.Component = AClass;
    if (options.interval) {

        reactClass.prototype.componentWillMount = function () {
            const tick = () => {
                const param = AClass.applyChain('paramInitializer');

                Utils.toPromise(AClass.applyChain('dataLoader', param))
                    .then(data => {
                        this.repatch({ data })
                        if (this['timerActivate'])
                            setTimeout(tick, options.interval);
                        return data;
                    });
            }
            setTimeout(tick, options.interval);
        }
        reactClass.prototype.componentWillUnmount = function () {
            delete this['timerActivate'];
        }
    }
    AClass.afterConsturct = function () {
        const param = AClass.applyChain('paramInitializer');
        this['timerActivate'] = 1;
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
            runAction: target.runAction.bind(this),
            root: target.refs.root,
            subrender: target.subrender.bind(target),
            showModal: target.showModal.bind(target)
        };

    }
    AClass.renderer(p => {
        if (p.state.data instanceof Promise) return <div ref="root" className="flex-center flex-full-center">

            <Spinner />
        </div>;

        return AClass.applyChain('dataRenderer', p)
    }
    );
    return Object.assign(AClass, { options, getRenderParams }) as any;
}
reinvent.factoryTable['frontend:dashboard:widget'] = classFactory;