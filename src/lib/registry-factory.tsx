
export function registryFactory<T>(mapper?: (result: T, key: string) => T) {
    let data = {}, notFounded = {}, secondaryValues = {};
    function getter(key, setValue?: T): T {
        if (arguments.length == 2) return set(key, setValue) as any;
        let result = (data[key]) as T;
        if (key instanceof Object) return key;

        if (key && result === undefined && !notFounded[key]) {
            console.warn('registry not found', key);
            notFounded[key] = 1;
        }
        mapper && (result = mapper.apply(getter, [result, key]));

        return result;
    }
    function register(delta: { [key: string]: T }) {
        Object.assign(data, delta);
    }
    function set(key: string, value: T, extraValue?) {
        let data = {};
        data[key] = value;
        extraValue !== undefined && (secondaryValues[key] = extraValue);
        register(data);
    }
    function directGet(key: string) {
        return this.data[key] || key;
    }
    return Object.assign(getter, { get: directGet, register, data, set, notFounded, secondaryValues });

}
