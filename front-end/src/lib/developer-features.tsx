import { BaseComponent } from './base-component';
import { openRegistry } from './registry';
import { Utils } from "./utils";
import * as JsonInspector from 'react-json-inspector';
import { IContextualMenuItem } from "office-ui-fabric-react";
import { instances } from './rest-api';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
export { JsonInspector };
export function isDevMode() {

    return !!DeveloperBar.developerFriendlyEnabled;
}
export const isDevelopmentEnv = () => !!DeveloperBar.isDevelopmentEnv;
export function isProdMode() {
    return !isDevelopmentEnv();
}
export type DevFriendlyCommand = (target: OrganicUi.IDeveloperFeatures & BaseComponent<any, any>) => void;
export const devTools = openRegistry<DevFriendlyCommand>();
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
    devPorts: OrganicUi.IDeveloperFeatures[];
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
                .map(ele => ele['componentRef'] as OrganicUi.IDeveloperFeatures)
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
        const frameworkVersion=OrganicUI.Version;
        return <div ref="root" dir='ltr' style={{ textAlign: 'left', padding: '2px', display: !DeveloperBar.developerFriendlyEnabled && 'none' }} className="developer-bar">
            {DeveloperBar.topElement}
            {!!DeveloperBar.developerFriendlyEnabled && <ActionButton
                menuProps={{
                    shouldFocusOnMount: true,
                    items: DeveloperBar.devMenuItems
                } as any} iconProps={{ iconName: 'Code' }}
            />}
            {!!DeveloperBar.developerFriendlyEnabled && this.renderDevButtonForRestClients()}
            {!!DeveloperBar.developerFriendlyEnabled
                && this.devPorts && this.devPorts.map(devPort => devPort.getDevButton())}
            {!!frameworkVersion && <span className="framework-version">
                <b>
                    Framework Ver:
            </b>
                <label>{frameworkVersion}</label></span>}
        </div>
    }
}
