import { Component, createElement, funcAsComponentClass, Utils, icon, BaseComponent, registryFactory } from "../organicUI";
import { HTMLAttributes, ReactElement } from "react";
export { default as JsonInspector } from 'react-json-inspector';
function isDevMode() {

    return !!DevFriendlyPort.developerFriendlyEnabled;
}
export type DevFriendlyCommand = (target, devPort: DevFriendlyPort) => void;
export const devTools = registryFactory<DevFriendlyCommand>();
export interface IDevFriendlyPortProps {
    targetText: string, target: any;
    noDevBar?: boolean;
}
export class DevFriendlyPort extends BaseComponent<HTMLAttributes<never> & IDevFriendlyPortProps, never>{

    devElement: any;
    static developerFriendlyEnabled: boolean;
    refs: {
        devBar: HTMLElement;
        root: HTMLElement;
    }
    getButtons() {
        const { targetText } = this.props;
        return [!!this.devElement &&
            <FabricUI.DefaultButton text={`Reset DevTools for ${targetText} `} onClick={() => (
                this.devElement = null,
                this.forceUpdate()
            )} />,

        <FabricUI.DefaultButton
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
            }} />
        ]

    }
    getDevBar() {
        if (!!this.props.noDevBar) return null;
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
        // debugger; 
        //  if (!isDevMode()) return this.props.children;
        
        const divProps = Object.keys(this.props).filter(key => key != 'target' && key != 'targetText' && key != 'noDevBar')
            .reduce((accum, key) => (accum[key] = this.props[key], accum), {});
        return createElement('div', Object.assign({}, divProps, {
            ref: `root`, className: Utils.classNames(`developer-port`, this.props.className), children: undefined
        }), isDevMode() && this.getDevBar(), (isDevMode() && this.devElement) || this.props.children);
    }
}


function DevPlaceHolder() {

}