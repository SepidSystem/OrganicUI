import { openBindingSource } from "./binding-source";


const quietChain = new Proxy({}, {
    get: () => () => quietChain
});
const all = [];
const modules = {}
function _reinvent(factoryName: string) {
    const { prefix } = reinvent;
    if (!prefix) throw `open.prefix is not defined`;
    if (factoryName.startsWith(prefix)) {
        const factory = factoryTable[factoryName];
        if (factory instanceof Function) {
            const AClass = factory.apply(this, Array.from(arguments).slice(1));
            Object.assign(AClass, { factoryName });
            all.push(AClass);
            return AClass;
        }
        else
            console.warn(`${factoryName} is not valid chainFactory`);

    }
    return quietChain;
}
const query = factoryName => all.filter(item => item.factoryName == factoryName);
const factoryTable = {};
const templates = {}
function templatedView(templName, extraParams) {
    if (templName instanceof Function) {
        const func = templName as Function;
        return function (templName, props) {
            const templComponent = templates[templName];
            const result = function (params) {
                const result = func.apply(this, arguments);
                const { children } = (result && result.props) || {} as any;
                const childrenArray = React.Children.toArray(children);
                return React.createElement(templComponent, Object.assign({ params }, props), ...childrenArray)

            }
            const resultFilter = templates[templName + '_resultFilter'];
             if (resultFilter instanceof Function) return resultFilter(result);
            return result;
        }


    }
    const templComponentType = templates[templName];
    if (!templComponentType) throw `template-name is missing  , template:${templName}`;
    const result = function (target, propertyName, propertyDescriptor: TypedPropertyDescriptor<any>) {
        const orginalMethod = propertyDescriptor.value;
        propertyDescriptor.value = function () {
            const result = orginalMethod.apply(this, arguments);
            const { children } = result && result.props;
            const props = Object.assign({ params: this.props }, extraParams || {});
            const childrenArray = React.Children.toArray(children);
            return React.createElement(templComponentType, props, ...childrenArray);
        };
    }

    return result;
}
export const reinvent: typeof _reinvent & {
    query, factoryTable, prefix,
    baseClassFactory: Function, templates: { [key: string]: React.ComponentClass<any> | Function },
    utils: any,
    modules: { [key: string]: any }
} = Object.assign(_reinvent, {
    baseClassFactory: () => { throw ' baseClassFactory is missed' },
    query, factoryTable, templates, prefix: '', modules, utils: {}, templatedView,
    openBindingHub: openBindingSource
});
Object.assign(window, { reinvent });