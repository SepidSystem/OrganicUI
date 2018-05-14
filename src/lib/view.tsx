import * as React   from "react";
 
import { ActionManager, remoteApiProxy } from './action-manager';
import * as Core from '../core';
import { icon, i18n, routeTable, BaseComponent } from '../core';
 
type discoverFunc = (func: () => Promise<any>) => void;
interface IDiscoverForBaseView {
    message: discoverFunc,
    masterData: discoverFunc,
    childData: discoverFunc,
    detailData: discoverFunc,
    detailL2Data: discoverFunc,

}
interface IExtraState {
    message: discoverFunc,
    masterData: discoverFunc,
    childData: discoverFunc,
    detailData: discoverFunc,
    detailL2Data: discoverFunc,
}
export class View<S, AC> extends BaseComponent<any, S> {
    static ChildViews: any;
    static Footer: any = 'copyright 2018';
    api: AC;
    static Instance: View<any, any>;
    capturedURLs: string[] = [];
    discover: IDiscoverForBaseView;
    constructor(props) {
        super(props);

        this.repatch = this.repatch.bind(this);
         window['currentView'] = this;
         
         (this as any).state= this.state || {};
        View.Instance = this;
        this.discover = this.makeDiscover();
    }

    static Template: string = 'base';
    prototypeWrapped = false;
    renderContent() {
        return <h1 className="warn">please read document!</h1>;
    }
    private makeDiscover(): IDiscoverForBaseView {

        return ['message',
            'masterData',
            'childData',
            'detailData',
            'detailL2Data',
        ].reduce((a, key) => {
            a[key] = f => {
                const s = this.state;
                if (s[key]) return;
                const promise = f();
                promise.then(objPart => {
                    let obj = {};
                    obj[key] = objPart;
                    this.repatch(obj);

                });

            }
            return a;
        }, {} as IDiscoverForBaseView);

    }


     
    loadingCount = 0;
    showLoading() {
        this.loadingCount++;
        return 'TODO';
    }
    errorCount = 0;
    showError(title, exc) {
        this.errorCount++;
        return 'TODO';
    }

}

export type FuncView<S, AC> = (props: any, state: S, repatch: Function, actions: AC) => React.ReactNode;
interface IFuncOpts {
    extraParameters?: Object, layoutName?, viewClass?: typeof View;
}
export function funcAsViewClass<S, AC>(func: FuncView<S, AC>, actionManagerClass, opts?: IFuncOpts): typeof View {
    let { extraParameters, viewClass, templName, layoutName } = opts || {} as any;
    class InnerView extends View<S, AC>{

        constructor(props) {
            extraParameters && Object.assign(props, extraParameters);
            super(props);

            this.api = new actionManagerClass();

        }

    }
    viewClass = viewClass || InnerView as any;;

    viewClass.prototype.render = function () {
        return func.apply(this, [this.props,
        this.state,
        (delta, target) => this.repatch(delta, target),
        this.actionManager
        ]);
    };
    viewClass.Template = templName || viewClass.Template;
    viewClass.LayoutName = layoutName || viewClass.LayoutName;
    return viewClass;
}
export class ViewWithFluentAPI<S, TAPI> extends View<S, TAPI>{
    constructor(p) {
            super(p);
        this.api = (remoteApiProxy() as any) as TAPI;
    }
}
Object.assign(Core, { funcAsViewClass });