import { BindingPoint } from "@reinvent";

const proxyHandlerForBinding: ProxyHandler<{ __name?, __path?, __isArray?}> = {
    get(target, key: string) {
        const __isArray = /^[0-9]+$/.test(key.toString());
        const proxyTarget = __isArray ?
            Object.assign({ __isArray }, target) : {
                __name: key, __path: target.__path.concat(target.__name ? [
                    target.__name + (target.__isArray ? '[]' : '')
                ] : [])
            };
        return target[key] = target[key] || new Proxy(proxyTarget, proxyHandlerForBinding);
    }
}
export function openBindingSource<T>(): T {
    return (new Proxy({ __name: null, __path: [] }, proxyHandlerForBinding) as any) as T;
}
const _globalBindingSource = openBindingSource();
export function globalBindingSource<T>() {
    return _globalBindingSource as T;
}
export function getFieldValue(data, accessor: BindingPoint): any {
    throw new Error("Method not implemented.");
}