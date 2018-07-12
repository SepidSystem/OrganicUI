
import * as React from "react";
import { Spinner } from "./spinner";
import { BaseComponent } from "./base-component";

const noThisMessage = 'cannot use this(target) in Templated Function , see MVT section in document '

// @Template
export function SubRender() {
    return function (target: any, propertyName: string, descriptor: TypedPropertyDescriptor<Function>) {
        const method = descriptor.value;

       
        descriptor.value = function () {
            const args = Array.from(arguments);
            if (args.some(arg => arg instanceof Promise)) return <Spinner />;
            // if (args.some(arg => (arg === undefined) || (arg === null))) return null;
            return method.apply(this, arguments);
        }.bind(target);
        Object.assign(descriptor.value, { mode: 'template' });
    }
}

//@Action
export function Action() {
    return function (target: any, propertyName: string, descriptor: TypedPropertyDescriptor<Function>) {
    }
}
function computeComponentInstanceHash(instance: BaseComponent<any, any>) {
    let counter = 0;
    const childs: any[] = [];
    const refIds = {};
    const sum0 = instance.refId;
    function sumRefId(sum, inst) {
        const result = refIds[inst.refId] ? sum : ((inst.state && inst.state.refId) || 0) + sum;
        refIds[inst.refId] = true;
        return result;
    }
    const sum1 = instance.querySelectorAll("*").reduce(sumRefId, 0);
    while (childs.length < counter++) {
        const child = childs[counter];
        child.props && child.props.children && childs.push(...React.Children.toArray(child.props.children));

    }
    const sum2 = childs.filter(c => c.state && c.state.refId).reduce(sumRefId, 0);
    return sum0 + sum1 + sum2;
}

export function ChildrenMapper({ cached }) {
    return function (target: BaseComponent<any, any>, propertyName: string, descriptor: TypedPropertyDescriptor<Function>) {
        if (cached)
            target['childrenMapperMemory'] = target['childrenMapperMemory'] || {};


        const orginMethod = descriptor.value;
        descriptor.value = function (children: React.ReactNode) {
            let hash = 0;
            let { childrenMapperMemory } = (target as any);
            if (childrenMapperMemory) {

                const hashArray = React.Children.toArray(children).map(c => computeComponentInstanceHash(c as any));
                hash = hashArray.reduce((sum, current) => sum + current, 0 as number);
                const cacheItem = childrenMapperMemory[propertyName];
                if (cacheItem && hash && (cacheItem.hash == hash))
                    return cacheItem.result;

            }
            const result = orginMethod.apply(this, arguments);
            childrenMapperMemory && (childrenMapperMemory[propertyName] = { hash, result });
            return result;
        }.bind(target);

    }
}

export function Event() {
    return function (target: BaseComponent<any, any>, propertyName: string, descriptor: TypedPropertyDescriptor<Function>) {
        target[propertyName] = descriptor.value.bind(target);
    }
}