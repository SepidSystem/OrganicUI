import { Component, createElement, funcAsComponentClass, Utils, icon, BaseComponent, registryFactory, FabricUI } from "../organicUI";
import { HTMLAttributes, ReactElement } from "react";
import { registryFactory } from '../organicUI';
function isDevMode() {

    return !!DevFriendlyDiv.developerFriendlyEnabled;
}
class DevFriendlyDiv extends Component<HTMLAttributes<never> & { targetText: string, target: any }>{

    behindElement: any;
    static developerFriendlyEnabled: boolean;
    static plugins = registryFactory<any>();
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
        const { plugins } = DevFriendlyDiv;
        return <div ref="devBar" style={{maxHeight:'0px'}}> 
            {<FabricUI.DefaultButton
                id={`DevTools${targetText}`}
                text={`DevTools for ${targetText}`}
                menuProps={{
                    shouldFocusOnMount: true,
                    items:
                        Object.keys(plugins.data)
                            .filter(key =>
                                key.startsWith(targetText + '|'))
                            .map(key => [key, plugins.data[key]])
                            .map(([key, onExecute]) => ({
                                key: key.split('|')[1],
                                name: 'New',
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
        }), this.getDevBar(), this.behindElement || this.props.children);
    }
}
document.addEventListener('keydown', e => {
    if (e.key == 'F1') {
        DevFriendlyDiv.developerFriendlyEnabled =
            !DevFriendlyDiv.developerFriendlyEnabled;
        const componentRefs =
            Array.from(document.querySelectorAll('developer-friendly')).map(ele => ele['componentRef'] as React.Component<any>);
        componentRefs.forEach(item => item.forceUpdate());
    }
}
);

function DevPlaceHolder() {

}