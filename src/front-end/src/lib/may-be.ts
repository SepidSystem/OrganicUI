export function createMayBeObject(target) {
    return target || new Proxy(window, mayBeProxy)
}
const mayBeProxy: ProxyHandler<any> = {

    get: (target, propName:string) => {

        if(/^get[A-Z]/.test(propName)  ) return ()=>null;
        return null;
    }   
}