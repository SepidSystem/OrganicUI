import { reinvent } from "./reinvent";
import { Utils } from "../core/utils";
import { Spinner } from '../core/spinner';
import { GridList, GridListTile, Paper } from '../controls/inspired-components'
import { BaseComponent } from "../core/base-component";
function injectRandomNumberToObject(obj) {
    const queue: { parent, key }[] = Object.keys(obj).map(key => ({ parent: obj, key }));
    let item;
    var cc = 0;
    while (item = queue.shift()) {
        const child = item.parent[item.key];
        if (typeof child == 'number')
            item.parent[item.key] = cc++;
        else if (typeof child == 'object')
            queue.push(...Object.keys(child).map(key => ({ parent: child, key })));
    }

}
function classFactory<TData, TState=any>(options: Reinvent.IDashboardWidgetOptions):
    Reinvent.IDashboardWidgetReinvent<TData, TState> {
    const chainMethods = ['paramInitializer', 'dataLoader', 'dataRenderer', 'size'];
    const AClass = reinvent.baseClassFactory({ chainMethods, className: 'dashboard-widget' });
    const reactClass: typeof React.Component = AClass;
    if (options.interval) {

        reactClass.prototype.componentWillMount = function () {
            const tick = () => {
                const param = AClass.applyChain('paramInitializer');

                Utils.toPromise(AClass.applyChain('dataLoader', param))
                    .then(data => {

                        if (localStorage.getItem('injectRandomNumberToDataLoad')) injectRandomNumberToObject(data);
                        this.repatch({ data });

                        if (options['timerActivate'])
                            setTimeout(tick, options.interval);
                        return data;
                    });
            }
            if (options['timerActivate'])
                setTimeout(tick, options.interval);
        }
        reactClass.prototype.componentWillUnmount = function () {
            delete options['timerActivate'];
        }
    }
    AClass.afterConsturct = function () {
        const param = AClass.applyChain('paramInitializer');
        options['timerActivate'] = !!options.interval;
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

class DashboardPage extends BaseComponent<never, never> {
    render() {
        const widgetES6Classes = reinvent.query('frontend:dashboard:widget');
        return (<article >
            <GridList cellHeight={400} spacing={20} cols={3} >
                {widgetES6Classes.map((widgetES6Class: any, idx) =>
                    <GridListTile cols={(widgetES6Class.options && widgetES6Class.options.cols) || 0}>
                        {(widgetES6Class.options && widgetES6Class.options.fragment) ?
                            React.createElement(widgetES6Class, {})
                            : <Paper className="block" style={{ padding: '10px', height: '98%' }}>
                                {React.createElement(widgetES6Class, {})}
                            </Paper>} </GridListTile>
                )}</GridList>
        </article>)
    }
}
reinvent.templates['dashboard'] = DashboardPage;