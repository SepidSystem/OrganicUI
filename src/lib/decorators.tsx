import { remoteApiProxy } from "./action-manager";
import * as React from "react";
import { routeTable } from "../core";
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
            if (args.some(arg => arg instanceof Promise)) return 'waiting...';
            if (args.some(arg => (arg === undefined) || (arg === null))) return null;
            return method.apply(this, arguments);
        }.bind(neverThis);
        Object.assign(descriptor.value, { mode: 'template' });
    }
}
export function ViewLogic(template: string, route: string) {
    return function (target: any, propertyName: string, descriptor: TypedPropertyDescriptor<Function>) {

        let method = descriptor.value;
        class InlineView extends React.PureComponent {
            static Template = template;
            api: any;
            constructor(p) {
                super(p);
                this.api = remoteApiProxy();
            }
            renderContent() {

                method.apply(this, [this.state, this.api,]);
            }
        }
        routeTable.set(route, InlineView);

    }
}
//@Action
export function Action() {
    return function (target: any, propertyName: string, descriptor: TypedPropertyDescriptor<Function>) {
    }
} 