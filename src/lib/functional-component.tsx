import { BaseComponent } from "./base-component";

export type FuncComponent<P, S> = (p: P, s: S, repatch: (delta, target?) => void) => React.ReactNode;
 

export function funcAsComponentClass<P, S>(func, defaultProps?) {
    class ReactClass extends BaseComponent<P, S>{
        base: any;
        linkState: any;
        constructor(p, s) {
            super(p);

            Object.assign(this, { state: {} });
        }
        orginRender(p, s, repatch) {
            return null;
        }

        render() {
            return this.orginRender && this.orginRender(this.props, this.state, (delta, target) => this.repatch(delta, target));
            /*return React.cloneElement(result, Object.assign({}, result.props, {
                ref: root => Object.assign(this.state, { root })

            }));*/
        }
    }
    ReactClass.prototype.orginRender = func;

    return ReactClass;
}