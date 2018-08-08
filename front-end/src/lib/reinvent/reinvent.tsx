

const quietChain = new Proxy({}, {
    get: () => () => quietChain
});
const all = [];
const units = {};
function _reinvent(factoryName: string) {
    const { prefix } = reinvent;
    if (!prefix) throw `open.prefix is not defined`;
    if (factoryName.startsWith(prefix)) {
        const factory = factoryTable[factoryName];
        if (factory instanceof Function) {
            const AClass = factory.apply(this, Array.from(arguments).slice(1));
            function unitName(value: string) {
                if (arguments.length == 1)
                    AClass._unitName = value;
                else if (arguments.length == 1)
                    return AClass._unitName;
                return AClass;
            }

            Object.assign(AClass, { factoryName, unitName });
            all.push(AClass);
            return AClass;
        }
        else
            console.warn(`${factoryName} is not valid chainFactory`);

    }
    return quietChain;
}
const query = factoryName =>{
     
    return all.filter(item => item.factoryName == factoryName);

} 
console.log({all});
const factoryTable = {};

export const reinvent: typeof _reinvent & {
    query, factoryTable, prefix,
    baseClassFactory: Function
} = Object.assign(_reinvent, {
    baseClassFactory: () => { throw ' baseClassFactory is missed' },
    query, factoryTable, prefix: ''
});