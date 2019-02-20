/// <reference path="../dts/globals.d.ts"  
import { BaseComponent } from './base-component';
import { funcAsComponentClass } from './functional-component';
import { Utils } from './utils';
import { IAdvButtonProps } from '@organic-ui';
import { ButtonProps } from '@material-ui/core/Button';

import { i18n, icon } from './shared-vars';
import { Spinner } from './spinner';
import { Callout as _Callout, Button } from '../controls/inspired-components';
import { DirectionalHint } from 'office-ui-fabric-react/lib/Callout';
const Callout: any = _Callout;
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
                <div key="title" className={" title is-6 is-vcentered "}>
                    {i18n(p.header)}
                    {p.actions && <DropDownButton key="actions" onActionExecute={p.onActionExecute} actions={p.actions} />}
                </div>
                <span key="temp" className="temp"></span>

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
                    if (!c) return;
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