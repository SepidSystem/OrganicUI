import { Component, createElement, funcAsComponentClass, Utils, icon, BaseComponent, registryFactory } from "../organicUI";
import { HTMLAttributes, ReactElement } from "react";
import * as JsonInspector from 'react-json-inspector';
import { IContextualMenuItem } from "office-ui-fabric-react";
export { JsonInspector };
export function isDevMode() {

    return !!DeveloperBar.developerFriendlyEnabled;
}
export const isDevelopmentMode = () => !!DeveloperBar.isDevelopmentEnv;
export type DevFriendlyCommand = (target: IDeveloperFeatures & BaseComponent<any, any>) => void;
export const devTools = registryFactory<DevFriendlyCommand>();
export interface IDevFriendlyPortProps {
    targetText: string, target: any;

}

export class DeveloperBar extends BaseComponent<any, any> {
    static isDevelopmentEnv: boolean;
    static topElement: any;
    static devMenuItems: IContextualMenuItem[];
    static developerFriendlyEnabled: boolean;
    timerId: any;
    renderedSigure: number;
    devPorts: IDeveloperFeatures[];
    refs: {
        root: HTMLElement;
    }
    getSigure() {
        return this.devPorts.reduce((a, devPort) => a + devPort.devPortId, 0);
    }
    scanDevPorts() {
        this.devPorts =
            Array.from(document.querySelectorAll('.developer-features'))
                .map(ele => ele['componentRef'] as IDeveloperFeatures)
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
        if (DeveloperBar.developerFriendlyEnabled) {
            DeveloperBar.devMenuItems = DeveloperBar.devMenuItems ||
                Object.keys(devTools.data).filter(s => !s.includes('|'))
                    .map(key => ({
                        key, name: key, onClick: () => devTools.data[key](this)
                    } as IContextualMenuItem));
        }
        return <div ref="root" dir='ltr' style={{ textAlign: 'left', padding: '2px' }} className="developer-bar">
            {DeveloperBar.topElement}
            {!!DeveloperBar.developerFriendlyEnabled && <FabricUI.ActionButton
                menuProps={{
                    shouldFocusOnMount: true,
                    items: DeveloperBar.devMenuItems
                }} iconProps={{ iconName: 'Code' }}
            />}
            {!!DeveloperBar.developerFriendlyEnabled &&  Utils.renderDevButton('REST',null)}
            {!!DeveloperBar.developerFriendlyEnabled
                && this.devPorts && this.devPorts.map(devPort => devPort.getDevButton())}
        </div>
    }
}
