import { chainFactoryTable } from "./shared-vars";

const quietChain = new Proxy({}, {
    get: () => () => quietChain
});
const all = [];
const units = {};
export function open(chainType: string) {
    const { prefix } = open as any;
    if (!prefix) throw `open.prefix is not defined`;
    if (chainType.startsWith(prefix)) {
        const chainFactory = chainFactoryTable(chainType);
        if (chainFactory instanceof Function) {
            const AClass = chainFactory.apply(this, Array.from(arguments).slice(1));
            function unitName(value: string) {
                if (arguments.length ==1)
                    AClass._unitName = value;
                else if (arguments.length == 1)
                    return AClass._unitName;
                return AClass;
            }

            Object.assign(AClass, { chainType,unitName });
            all.push(AClass);
            return AClass;
        }
        else
            console.warn(`${chainType} is not valid chainFactory`);

    }

    return quietChain;

}
const query = chainType => all.filter(item => item.chainType == chainType);
Object.assign(open, { query });