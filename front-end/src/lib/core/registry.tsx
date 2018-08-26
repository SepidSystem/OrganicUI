

export function openRegistry<T>(mapper?: (result: T, key: string) => T): OrganicUi.IRegistry<T> {
    let data = {}, notFounded = {}, secondaryValues = {};
    const testers: OrganicUi.CustomTesterForRegistry[] = [], resultForTesters: T[] = [];
    function getter(key, setValue?: T): T {
        if (key === undefined) return;
        if (arguments.length == 2) return getter['set'](key, setValue) as any;
        if (key instanceof Object) return key;
        let result = (data[key]) as T;

        if (key && result === undefined && !notFounded[key]) {
            //OrganicUI.Utils.warn('registry not found', key);
            notFounded[key] = 1;
        }
        if (!result) {
            let counter = 0;
            for (const tester of testers) {

                if (((tester instanceof Function) && tester(key))
                    || ((tester instanceof RegExp) && tester.test(key))
                    //    || (typeof tester == 'string' && wildcard(tester, key))
                ) {
                    result = resultForTesters[counter];
                    break;
                }
                counter++;
            }

        }

        mapper && (result = mapper.apply(getter, [result, key]));
        return result;
    }
    function register(delta: { [key: string]: T }) {
        Object.assign(data, delta);
    }
    function set(key: string, value: T, extraValue?) {
        extraValue !== undefined && (secondaryValues[key] = extraValue);
        register({ [key]: value });
    }

    const directGet = (key: string) => data[key] || key;
    const customTester = (tester: OrganicUi.CustomTesterForRegistry, value: T) => (testers.push(tester), resultForTesters.push(value));
    const clear = () => (data = {}, secondaryValues = {});
    return Object.assign(getter, { clear, get: directGet, register, data, set, notFounded, secondaryValues, customTester });

}
