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
function templatedView(templName: string, { actions, options, ref, customActions }) {
    const templComponent = templates[templName];
    return function (target, propertyName, propertyDescriptor: TypedPropertyDescriptor<any>) {
        const orginalMethod = propertyDescriptor.value;
        propertyDescriptor.value = function () {
            const result = orginalMethod.apply(this, arguments);
            const { children } = result && result.props;
            const props = Object.assign({}, result.props,
                { options, actions, params: this.props },
                ref ? { ref } : {},
                customActions ? { customActions } : {});
            const childrenArray = React.Children.toArray(children);
            return React.createElement(templComponent, props, ...childrenArray);
        };
    }
}
export const reinvent: typeof _reinvent & {
    query, factoryTable, prefix,
    baseClassFactory: Function, templates: { [key: string]: React.ComponentClass<any> },
    utils: any,
    modules: { [key: string]: any }
} = Object.assign(_reinvent, {
    baseClassFactory: () => { throw ' baseClassFactory is missed' },
    query, factoryTable, templates, prefix: '', modules, utils: {}, templatedView,
    openBindingHub:openBindingSource
});
Object.assign(window, { reinvent });