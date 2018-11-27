import { BaseComponent } from "./base-component";
interface IAsyncContainer<T> {

}
interface IMemo {
    index: string;
    target: AsyncContainerItem;
    __metaDataMode: true
}
let isMetaDataMode = false;
class UseAsync {

    constructor() { }
    method: Function;
    args: any[];
    logic(method, ...args) {
        this.method = method;
        this.args = args;
    }
    target(memo: IMemo, opts?) {
        if (!memo.__metaDataMode) {
            if (location.hostname == 'localhost') alert('invalid memo on useAsync');
            throw 'invalid memo on useAsync ';
        }
        isMetaDataMode = false;
        this.method = null;
        this.args = null;
        const options = Object.assign({ reset: false }, opts || {});
        const { index, target } = memo;
        if (options.reset)
            target.data[index] = null;
        if (target.data[index]) return;
        target.data[index ] = this.method(...this.args);
         


    }
}
const useAsyncWorker = new UseAsync()
export function useAsync() {
    isMetaDataMode = true;

    return useAsyncWorker;
}
interface AsyncContainerItem {
    data: any;
    owner: BaseComponent<any, any>;
}
const proxyHandler: ProxyHandler<AsyncContainerItem> = {
    get(target, index) {
        if (isMetaDataMode) return { index, target, __metaDataMode: true } as IMemo;
        return target.data[index];
    },
    set(target, index, value) {
        target.data[index] = value;
        return true;
    }
}

export function asyncContainer<T>(owner: BaseComponent<any, any>): IAsyncContainer<T> {
    const target: AsyncContainerItem = { data: {}, owner };
    return new Proxy(target, proxyHandler);
}