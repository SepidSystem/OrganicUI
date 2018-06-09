import { remoteApiProxy } from "./action-manager";
import * as React from "react";
import { Spinner } from "./spinner";
const noThisMessage = 'cannot use this(target) in Templated Function , see MVT section in document '

// @Template
export function Template() {
    return function (target: any, propertyName: string, descriptor: TypedPropertyDescriptor<Function>) {
        const method = descriptor.value;

        const neverThis = new Proxy<never>({} as never, {
            get: () => { throw noThisMessage },
            set: () => { throw noThisMessage }


        });
        descriptor.value = function () {
            const args = Array.from(arguments);
            if (args.some(arg => arg instanceof Promise)) return <Spinner /> ;
            if (args.some(arg => (arg === undefined) || (arg === null))) return null;
            return method.apply(this, arguments);
        }.bind(neverThis);
        Object.assign(descriptor.value, { mode: 'template' });
    }
}
 
//@Action
export function Action() {
    return function (target: any, propertyName: string, descriptor: TypedPropertyDescriptor<Function>) {
    }
} 