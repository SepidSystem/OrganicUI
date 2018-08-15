/// <reference path="../dts/globals.d.ts"  
import { BaseComponent } from './base-component';
import { funcAsComponentClass } from './functional-component';
import { Utils } from './utils';

import { ButtonProps } from '@material-ui/core/Button';

import { i18n, icon } from './shared-vars';
import { Spinner } from './spinner';
import { Callout, Button } from '../controls/inspired-components';
import { DirectionalHint } from 'office-ui-fabric-react/lib/Callout';
function dropDownButton(p: IDropDownProps, s: IDropDownState, repatch) {
    const iconCode = p.iconCode || 'more';
    const isActive = !!s.root && s.root.classList && s.root.classList.contains('is-active');

    return <div className={["dropdown", p.isReverse ? 'is-right' : 'is-left', p.className, isActive && 'is-active'].filter(x => !!x).join(' ')}>
        <div className="dropdown-trigger">
            <button
                className={Utils.classNames("button", 'is-text', p.buttonClass)}
                style={{ padding: '0' }}
                onClick={e => {
                    e.preventDefault();
                    if (!s.root) {
                        Utils.warn('root of dropdown is null ');
                        return;
                    }

                    const isActive = s.root.classList.contains('is-active');
                    const classNameForActivate = 'is-active';
                    Array.from(document.querySelectorAll('.dropdown')).forEach(element => element.classList.remove(classNameForActivate));
                    (isActive) ?
                        s.root.classList.remove(classNameForActivate)
                        : s.root.classList.add(classNameForActivate);

                }}

                aria-haspopup="true" aria-controls="dropdown-menu">

                {p.buttonText && <span className="">{i18n(p.buttonText)}</span>}
                {!iconCode && <div style={{ display: 'flex', height: '3rem' }} className={[isActive && 'is-active', 'navbar-burger'].filter(x => x).join(' ')}>
                    <span />
                    <span />
                    <span />
                </div>}
                {iconCode && <span className="icon is-small">
                    {icon(iconCode)}
                </span>}
            </button>
        </div>
        <div className="dropdown-menu" id="dropdown-menu" role="menu">
            <div className="dropdown-content">
                {p.actions && p.actions.map(action => (action == '-' ? <hr className="dropdown-divider"></hr> : <a
                    onClick={e => (e.preventDefault(), s.root && s.root.classList.remove('is-active'), p.onActionExecute(action))}
                    href="#" className="dropdown-item">{i18n(action)}</a>))}

            </div>
        </div>
    </div>
}

interface IDropDownProps {
    isReverse?: boolean;
    className?: string;
    actions?: string[];
    iconCode?: string;
    isActive?: boolean;
    buttonText?: string;
    buttonClass?: string;
    onActionExecute?: (s: string) => void;

}
interface IDropDownState {
    root: HTMLElement;
}
export const DropDownButton = funcAsComponentClass<IDropDownProps, IDropDownProps>(dropDownButton);
export function SearchInput(p: { className?: string }) {
    return <p key="control" className={Utils.classNames("control has-icons-right", p.className)}>
        <input className={["input", p.className].filter(x => x).join(' ')} type="text" placeholder="search"></input>
        <span className={["icon is-right", p.className].filter(x => x).join(' ')}>
            <i className="fa fa-search"></i>
        </span>
    </p>
}


interface IAdvButtonProps {
    children?: any;
    isLoading?: boolean;
    isError?: boolean;
    callout?: any;
    primary?: boolean;
    type?: 'primary' | 'link' | 'info' | 'success' | 'warning' | 'danger';
    size?: 'small' | 'medium' | 'large';
    onClick?: () => any;
    fixedWidth?: boolean;
    className?: string;
    calloutWidth?: number;
    lastMod?: number;
    buttonComponent?: any;
}

export class AdvButton extends BaseComponent<ButtonProps & IAdvButtonProps, IAdvButtonProps>{
    refs: {
        root: Element
    }
    closeCallOut() {
        this.repatch({ callout: null });
    }
    render(p = this.props, s = this.state, repatch = this.repatch) {
        const className = Utils.classNames("adv-button", p.className, p.fixedWidth && 'is-fixed-width', s.isLoading && 'is-loading', p.size && 'is-' + p.size);
        const advButton = <Button className={className}
            {...p}
            onClick={e => {
                e.preventDefault();
                if (s.callout) return repatch({ callout: null });
                const asyncClick = async () => {
                    const resultAsync = p.onClick instanceof Function && p.onClick();
                    if (resultAsync instanceof Promise) {
                        repatch({ isLoading: true, callout: null });

                        resultAsync.catch(error => {
                            console.log('Advanced Button Error>>>>>', error);
                            repatch({ isLoading: false, callout: null, isError: true });
                            repatch({ isError: false }, null, 2000);

                            return error;
                        })
                        Promise.all([resultAsync])
                            .then(([result]) => {

                                const lastMod = +new Date();
                                React.isValidElement(result) && setTimeout(() => this.repatch({ isLoading: false, callout: result, lastMod }), 500);
                                React.isValidElement(result) && setTimeout(() => s.lastMod == lastMod && this.repatch({ callout: null, isLoading: false }), 40000);
                                !React.isValidElement(result) && repatch({ isLoading: false, callout: null });
                            });
                    }
                }
                !s.isLoading && asyncClick();
            }
            }
        >
            {!s.isError && !s.isLoading && !s.callout && p.children}
            {!s.isLoading && s.callout && i18n('hide-result')}

            {!!s.isError && <i className="fa fa-exclamation-triangle"></i>}
            {s.isLoading && <Spinner />}
        </Button>;
        React.createElement(p.buttonComponent || Button,
            Object.assign({}, p, {
                className: Utils.classNames(p.className, p.fixedWidth && 'is-fixed-width', s.isLoading && 'is-loading', p.size && 'is-' + p.size),
                //    iconProps: !s.isLoading && p.iconProps,

            }),
            !s.isLoading && !s.callout && p.children,
            !s.isLoading && s.callout && i18n('hide-result'),
            s.isLoading && <Spinner />);
        return <span ref="root" className="adv-button"
        > {advButton}
            {React.isValidElement(s.callout) &&
                <Callout directionalHint={DirectionalHint.topCenter as any} calloutWidth={p.calloutWidth || 500} onDismiss={() => this.repatch({ callout: null, lastMod: +new Date() })} target={this.refs.root} >
                    {s.callout}
                </Callout>}
        </span>

    }
}




function panel(p: OrganicUi.IPanelProps, s: OrganicUi.IPanelProps, repatch: Function) {
    const changeBlock = (selectedTab: string) => repatch({ selectedTab });
    const handleSelect = e => {
        const target: HTMLElement = e.target as HTMLElement;
        const value = Array.from(target.querySelectorAll("option")).filter(o => o.selected).map(o => o.value).join('');
        changeBlock(value);
    }

    s.selectedBlock = s.selectedBlock || p.selectedBlock;
    if (parseInt(p.selectedBlock as any) == p.selectedBlock as any)
        s.selectedBlock = s.selectedBlock || p.blocks[+p.selectedBlock];
    let children: any[] = p.children;
    if (children && !(children instanceof Array)) children = [children];
    return (<div className="panel-wrapper">

        <div className="panel" key="panel">
            {!!p.header && <div className={"panel-heading " + ((p.actions && 'actionable') || '')}>
                <span key="temp" className="temp"></span>
                <div key="title" className={" title is-6 is-vcentered "}>
                    {i18n(p.header)}
                    {p.actions && <DropDownButton key="actions" onActionExecute={p.onActionExecute} actions={p.actions} />}
                </div>

            </div>}
            {!!p.hasSearch && <div key="block" className="panel-block">
                <SearchInput className="is-small" />
            </div>}
            {!!p.tabs && <p className="panel-tabs">
                {p.tabs.map(t => (<a onClick={e => {
                    e.preventDefault();
                    repatch({ selectedTab: t });
                }} className={s.selectedTab == t ? "is-active" : ""}>{i18n(t)}</a>))}
            </p>}
            {p.blocks && <div key="blocks" className={`panel-blocks ${p.blocks.length > 5 ? 'has-scroll' : ''}`}>
                {p.blocks && p.blocks.map((b, idx) => typeof b == 'string' ? (
                    <a onClick={e => {
                        e.preventDefault();
                        repatch({ selectedBlock: b });
                        p.onSelectBlock(idx);
                    }} className={"panel-block " + (b == s.selectedBlock ? 'is-active' : '')}>

                        {i18n(b)}
                    </a>) : (<div key="block" className="panel-block">
                        {b}
                    </div>))}
            </div>}
            <div key="content" className="  panel-content">
                {children && children.map(c => {
                    if(!c) return ;
                    const props = Object.assign({}, c.props || {}) || {};
                    if (p.classNamePerChild) {
                        Object.assign(props, { className: p.classNamePerChild });
                        return Object.assign({}, c, { props });
                    }
                    return c;
                })}

            </div>
        </div>
    </div>
    );
}
export const Panel = funcAsComponentClass<OrganicUi.IPanelProps, OrganicUi.IPanelProps>(panel);

export function Placeholder(p: { for, children }) {
    return <span className="placeholder-item" data-for={p.for} style={{ display: 'none' }}>{p && p.children}</span>;
}