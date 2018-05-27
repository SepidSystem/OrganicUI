import { Component, createElement, funcAsComponentClass, Utils, icon, BaseComponent, registryFactory } from "../organicUI";
import { HTMLAttributes, ReactElement } from "react";
import * as JsonInspector from 'react-json-inspector';
export { JsonInspector };
function isDevMode() {

    return !!DevFriendlyPort.developerFriendlyEnabled;
}
export type DevFriendlyCommand = (target, devPort: DevFriendlyPort) => void;
export const devTools = registryFactory<DevFriendlyCommand>();
export interface IDevFriendlyPortProps {
    targetText: string, target: any;

}
export class DevFriendlyPort extends BaseComponent<HTMLAttributes<never> & IDevFriendlyPortProps, never>{
    static devPortCounter: number = 1;
    static lastBlinkElement: any;
    static developerFriendlyEnabled: boolean;
    devPortId: number;
    devElement: any;
    refs: {
        devBar: HTMLElement;
        root: HTMLElement;
    }
    constructor(p) {
        super(p);
        this.devPortId = DevFriendlyPort.devPortCounter++;
    }
    getDevButton() {
        const { targetText } = this.props;
        const topItems = [{
            key: 'reset',
            name: `Reset DevTools `,
            onClick: () => (this.devElement = null, this.forceUpdate())
        }].filter(item => !!item);

        return <FabricUI.DefaultButton onMouseEnter={() =>    this.refs.root.classList.add('dev-target')  }
        onMouseLeave={()=>this.refs.root.classList.remove('dev-target')}
            id={`DevTools${targetText}`}
            text={`DevTools for ${targetText}`}
            menuProps={{
                shouldFocusOnMount: true,
                items:
                    topItems.concat(
                        Object.keys(devTools.data)
                            .filter(key =>
                                key.startsWith(targetText + '|'))
                            .map(key => [key, devTools.data[key]])
                            .map(([key, onExecute]) => ({
                                key: key.split('|')[1],
                                name: key.split('|')[1],
                                onClick: () => onExecute(this.props.target, this)
                            })))
            }} />;


    }

    render() {
        const divProps = Object.keys(this.props).filter(key => key != 'children' && key != 'target' && key != 'targetText')
            .reduce((accum, key) => (accum[key] = this.props[key], accum), {});
        return createElement('div', Object.assign({}, divProps, {
            ref: `root`, className: Utils.classNames(`developer-port`, this.props.className), children: undefined
        }),
            (isDevMode() && this.devElement) || this.props.children
        );
    }
}

export class DeveloperBar extends BaseComponent<any, any> {
    timerId: any;
    renderedSigure: number;
    devPorts: DevFriendlyPort[];
    refs: {
        root: HTMLElement;
    }
    getSigure() {
        return this.devPorts.reduce((a, devPort) => a + devPort.devPortId, 0);
    }
    scanDevPorts() {
        this.devPorts =
            Array.from(document.querySelectorAll('.developer-port'))
                .map(ele => ele['componentRef'] as DevFriendlyPort)
                .filter(ele => !!ele);
        if (this.timerId && this.refs.root && this.renderedSigure != this.getSigure()) {
            this.renderedSigure = this.getSigure();
            this.forceUpdate();
        }
    }
    componentWillMount() {
        this.scanDevPorts();
        this.timerId = setInterval(this.scanDevPorts.bind(this), 800);
    }
    componentWillUnmount() {
        clearInterval(this.timerId);
    }
    render() {

        return <div ref="root" dir='ltr' style={{ textAlign: 'left', padding: '2px' }} className="developer-bar">
            {!!DevFriendlyPort.developerFriendlyEnabled
                && this.devPorts && this.devPorts.map(devPort => devPort.getDevButton())}
        </div>
    }
}
