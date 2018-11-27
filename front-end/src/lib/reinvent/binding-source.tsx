import { IBindingPoint } from "@reinvent";

class ExtendableProxy<T extends object> {
    constructor(handlers: ProxyHandler<T>) {
        return new Proxy((this as any), handlers);
    }
}
export class BindingPoint extends ExtendableProxy<IBindingPoint> implements IBindingPoint {
    constructor(public __name: string, public __path: string[], public __isArray: boolean) {
        super(proxyHandlerForBinding);
    }

}
export class BindingSource extends BindingPoint {
     getFieldValue(data, bindingPoint: BindingPoint) {
        const { __path, __name } = (typeof bindingPoint == 'string') ? { __name: bindingPoint as string, __path: [] } : bindingPoint;
        let parent = data;
        if (__path[__path.length - 1] == __name)
            __path.splice(__path.length - 1);
        for (let key of __path) {
            if (key.endsWith('[]')) {
                parent = data;
                continue;
            }

            parent = parent[key];
        }
        
        return parent[__name];
    }
    setFieldValue(data, bindingPoint: BindingPoint, value, indexes?: { [key: string]: number }) {
         const { __path, __name } = (typeof bindingPoint == 'string') ? { __name: bindingPoint as string, __path: [] } : bindingPoint;
        let parent = data;
        for (const key of __path) {
            if (key.endsWith('[]')) {
                const parentKey = key.replace('[]', '');
                const index = indexes && indexes[parentKey];
                if (index === undefined) {
                    parent = data;
                    continue;
                } //throw `invalid index for ${key}`;
                parent = parent[parentKey][index];
            }
            else
                parent = parent[key];
        }
        parent[__name] = value;
    }

    constructor() {
        super(null, [], false);
       
    }
}
const proxyHandlerForBinding: ProxyHandler<IBindingPoint> = {
    get(target, key: string) {
        const result = target[key];
        if (result) return result;
        const isArray = /^[0-9]+$/.test(key.toString());
        const { __path, __isArray, __name } = target;

        const path = __path.slice(0, __isArray ? __path.length - 1 : __path.length).concat(__name ? [
            __name + (__isArray ? '[]' : '')
        ] : []);

        const bindingPoint = new BindingPoint(isArray ? __name : key, path, isArray);
        target[key] = bindingPoint;
        return bindingPoint;
    },
    set(target, p, value, receiver) {
        target[p] = value;
        return true;
    }
}

export function openBindingSource<T>(): T {
    return (new BindingSource() as any);
}