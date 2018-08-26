const proxyHandlerForBinding: ProxyHandler<{ __name }> = {
    get(target, key: string) {
        
        return target[key] = target[key] || new Proxy(/^[0-9]+$/.test(key.toString()) ? target : { __name: key }, proxyHandlerForBinding);
    }
}
export function openBindingSource<T>(): T {
    return new Proxy({}, proxyHandlerForBinding) as T;
}
const _globalBindingSource = openBindingSource();
export function globalBindingSource<T>() {
    return _globalBindingSource as T;
}