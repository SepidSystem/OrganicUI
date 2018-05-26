import { Component, createElement, funcAsComponentClass, Utils, icon, BaseComponent, registryFactory, FabricUI } from "../organicUI";
import { HTMLAttributes, ReactElement } from "react";

function isDevMode() {

    return !!DevFriendlyPort.developerFriendlyEnabled;
}
export const devTools = registryFactory<any>();
export type DevFriendlyCommand = (target, devPort: DevFriendlyPort) => void;
export class DevFriendlyPort extends BaseComponent<HTMLAttributes<never> & { targetText: string, target: any }, never>{

    devElement: any;
    static developerFriendlyEnabled: boolean;
    refs: {
        devBar: HTMLElement;
        root: HTMLElement;
    }
    componentDidMount() {
        (this.refs.root)
            && Object.assign(this.refs.root, { componentRef: this });
    }
    getDevBar() {
        const { targetText } = this.props;
        return <div ref="devBar" className="dev-bar" style={{ maxHeight: '0px' }}>
            {!!this.devElement &&
                <FabricUI.DefaultButton text={`Reset DevTools`} onClick={() => (
                    this.devElement = null,
                    this.forceUpdate()
                )} />
            }
            {<FabricUI.DefaultButton
                id={`DevTools${targetText}`}
                text={`DevTools for ${targetText}`}
                menuProps={{
                    shouldFocusOnMount: true,
                    items:
                        Object.keys(devTools.data)
                            .filter(key =>
                                key.startsWith(targetText + '|'))
                            .map(key => [key, devTools.data[key]])
                            .map(([key, onExecute]) => ({
                                key: key.split('|')[1],
                                name: key.split('|')[1],
                                onClick: () => onExecute(this.props.target, this)
                            }))
                }}
            />}
        </div>;
    }
    render() {
        if (!isDevMode()) return this.props.children;
        return createElement('div', Object.assign({}, this.props, {
            ref: `root`, className: Utils.classNames(`developer-friendly `, this.props.className), children: undefined
        }), this.getDevBar(), this.devElement || this.props.children);
    }
}
document.addEventListener('keydown', e => {
    if (e.key == 'F1') {
        DevFriendlyPort.developerFriendlyEnabled =
            !DevFriendlyPort.developerFriendlyEnabled;
        const componentRefs =
            Array.from(document.querySelectorAll('developer-friendly')).map(ele => ele['componentRef'] as React.Component<any>);
        componentRefs.forEach(item => item.forceUpdate());
    }
}
);

function DevPlaceHolder() {

}