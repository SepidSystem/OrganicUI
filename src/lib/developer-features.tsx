import { BaseComponent } from './base-component';
import { registryFactory } from './registry-factory';
import { Utils } from "./utils";
import * as JsonInspector from 'react-json-inspector';
import { IContextualMenuItem } from "office-ui-fabric-react";
import { IDeveloperFeatures } from "@organic-ui";
import { instances } from './rest-api';
export { JsonInspector };
export function isDevMode() {

    return !!DeveloperBar.developerFriendlyEnabled;
}
export const isDevelopmentEnv = () => !!DeveloperBar.isDevelopmentEnv;
export type DevFriendlyCommand = (target: IDeveloperFeatures & BaseComponent<any, any>) => void;
export function isProdMode() {
    return !isDevelopmentEnv();
}
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
        if (!isDevMode()) return;
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
    renderDevButtonForRestClients() {
        return instances.map(
            target => {
                let { options } = target;
                options = options instanceof Function ? options() : options;
                const targetText = options && options.title;

                return targetText && Utils.renderDevButton({ prefix: 'REST', targetText }, target);
            });
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
            {!!DeveloperBar.developerFriendlyEnabled && this.renderDevButtonForRestClients()}
            {!!DeveloperBar.developerFriendlyEnabled
                && this.devPorts && this.devPorts.map(devPort => devPort.getDevButton())}
        </div>
    }
}
