const proxyHandlerForBinding: ProxyHandler<{ __name }> = {
    get(target, key: string) {
        if (/^[0-9]+$/.test(key.toString())) return target;
        return target[key] = target[key] || new Proxy({ __name: key }, proxyHandlerForBinding);
    }
}
export function openBindingSource<T>(): T {
    return new Proxy({}, proxyHandlerForBinding) as T;
}