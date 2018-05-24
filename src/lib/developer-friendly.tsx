import { Component, createElement, funcAsComponentClass, Utils, icon, BaseComponent, registryFactory } from "../core";
import { HTMLAttributes } from "react";
function isDevMode() {
    return true;
}
class DevFriendlyDiv extends Component<HTMLAttributes<never>>{
    static all: DevFriendlyDiv[] = [];
    behindElement: any;
    getDevBar() {
        return 'sdfsd';
    }
    render() {
        if (!isDevMode()) return this.props.children;
        return createElement('div', Object.assign({}, this.props, {
            className: Utils.classNames(`developer-friendly `, this.props.className), children: undefined
        }), this.getDevBar(), this.behindElement || this.props.children);
    }
}
document.addEventListener('keydown', e =>
    (e.key == 'F1') && document.documentElement.classList.toggle('developer-friend')
);

function DevPlaceHolder() {

}