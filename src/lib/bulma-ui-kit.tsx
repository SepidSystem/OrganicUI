import * as React from "react";
import { icon, i18n, funcAsComponentClass, FuncComponent, BaseComponent } from "../organicUI";
import { Utils } from "./utils";
const { classNames } = Utils;
declare const h: any;

interface IActions {
    actions?: any[];
}
interface ICardProps extends IActions {
    header: any;
    children?: any;
    className?: string;
}
const DropDownButton = p => null;
export function Card(p: ICardProps) {
    return (<div className={["card", p.className].join(' ')}>
        {!!p.header && <header className={["card-header", p.actions && 'actionable'].filter(x => x).join(' ')}>
            <p className="card-header-title">
                {p.header}
            </p>
            {p.actions && <DropDownButton actions={p.actions} />}
        </header>}
        <div className="card-content">
            <div className="content">
                {p.children}
            </div>
        </div>
        <br />

    </div>);
}


export interface IPanelProps extends IActions {
    header?: any;
    tabs?: string[];
    blocks?: any[];
    hasSearch?: boolean;
    selectedTab?: string;
    selectedBlock?: number | string;
    onSelectBlock?: (index: number) => void
    children: any;
    classNamePerChild?: string;
    onActionExecute?: (s: string) => void;
}
function panel(p: IPanelProps, s: IPanelProps, repatch: Function) {
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

        <div className="panel">
            {!!p.header && <p className={"panel-heading " + ((p.actions && 'actionable') || '')}>
                <span className="temp"></span>
                <div className={" title is-6 is-vcentered "}>
                    {typeof p.header == 'string' ? i18n(p.header) : p.header}
                    {p.actions && <DropDownButton onActionExecute={p.onActionExecute} actions={p.actions} />}
                </div>

            </p>}
            {!!p.hasSearch && <div className="panel-block">
                {/*  <SearchInput className="is-small" /> */}
            </div>}
            {!!p.tabs && <p className="panel-tabs">
                {p.tabs.map(t => (<a onClick={e => {
                    e.preventDefault();
                    repatch({ selectedTab: t });
                }} className={s.selectedTab == t ? "is-active" : ""}>{i18n(t)}</a>))}
            </p>}
            {p.blocks && <div className={`panel-blocks ${p.blocks.length > 5 ? 'has-scroll' : ''}`}>
                {p.blocks && p.blocks.map((b, idx) => typeof b == 'string' ? (
                    <a onClick={e => {
                        e.preventDefault();
                        repatch({ selectedBlock: b });
                        p.onSelectBlock(idx);
                    }} className={"panel-block " + (b == s.selectedBlock ? 'is-active' : '')}>

                        {i18n(b)}
                    </a>) : (<div className="panel-block">
                        {b}
                    </div>))}
            </div>}
            <div className="panel-block panel-content">
                {children && children.map(c => {
                    const props = Object.assign({}, c.props);
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
export const Panel = funcAsComponentClass<IPanelProps, IPanelProps>(panel);
interface ITabsProps extends IActions {
    tabs: string[];
    selectedTab?: string;
    onSelectedTabChange?: (tab: string) => void
    className?: string;
}
const tabs = (p: ITabsProps, s: ITabsProps, repatch: Function) =>
    (s.selectedTab = s.selectedTab || p.tabs[0], <div className={["tabs", p.actions && "actionable", p.className].filter(x => x).join(' ')} >

        <ul className="is-hidden-touch">
            {p.tabs && p.tabs.map(t => (<li className={s.selectedTab == t ? "is-active" : ''}>
                <a className="" onClick={e => (e.preventDefault(), p.onSelectedTabChange && p.onSelectedTabChange(t), repatch({ selectedTab: t }))}>{Utils.showIconText(t)}</a>
            </li>))}
        </ul>
        <ul className="is-hidden-desktop">
            {p.tabs && p.tabs.map((t, idx) => (<li className={s.selectedTab == t ? "is-active" : ''}>
                <a className="" onClick={e => (e.preventDefault(), p.onSelectedTabChange && p.onSelectedTabChange(t), repatch({ selectedTab: t }))}>
                    <span className="tab-num">{idx + 1}</span>
                    {s.selectedTab == t ? Utils.showIconText(t) : ''}  </a>
            </li>))}
        </ul>
        {p.actions && <DropDownButton actions={p.actions} />}
    </div>);
export const Tabs = funcAsComponentClass<ITabsProps, ITabsProps>(tabs);



interface IStepsProps {
    size: 'small' | 'medium';
    steps: any[];
    stepDetails: any[];
    activeStep: number;
    children: any;
}
const steps: FuncComponent<IStepsProps, IStepsProps> = (p, s, repatch) => (
    <ul className={classNames("steps", p.size && `is-${p.size}`)} >
        {p.steps.map((step, idx) =>
            (<li className={classNames("step-item", idx < p.activeStep && "is-completed", idx == p.activeStep && "is-active")}>
                <div className="step-marker">{idx + 1}</div>
                <div className="step-details">
                    <p className="step-title">{step}</p>
                </div>
            </li>))}

        {!!p.children && <div className="steps-content">
            {p.children}
        </div>}
    </ul>);


export const Steps = funcAsComponentClass<IStepsProps, IStepsProps>(steps);

interface ICarouselProps {
    items: any[];
}
const carousel: FuncComponent<ICarouselProps, ICarouselProps> = (p, s, repatch) => (
    <div className='carousel carousel-animated carousel-animate-slide'>
        <div className='carousel-container'>
            {p.items.map(item => (<div className='carousel-item has-background'>
                <img className="is-background" src="https://wikiki-c4319bfccd.drafts.github.io/images/singer.jpg" alt="" width="640" height="310" />
                <div className="title">Original Gift: Offer a song with <a href="https://lasongbox.com" target="_blank">La Song Box</a></div>
            </div>))}

        </div>
        <div className="carousel-navigation">
            <button className="carousel-nav-left" onClick={e => (e.preventDefault(), repatch({}))}>
                <i className="fa fa-chevron-left" aria-hidden="true"></i>
            </button>
            <button className="carousel-nav-right" onClick={e => (e.preventDefault(), repatch({}))}>
                <i className="fa fa-chevron-right" aria-hidden="true"></i>
            </button>
        </div>
    </div>
);
export const Carousel = funcAsComponentClass<ICarouselProps, ICarouselProps>(carousel);

interface ITimelineProps {
    start: any;
    end: any;
    items: any[];
}
const timeline: FuncComponent<ITimelineProps, ITimelineProps> = (p, s, repatch) => (
    <div className="timeline is-centered">
        <header className="timeline-header">
            <span className="tag is-medium is-primary">Start</span>
        </header>
        <div className="timeline-item is-primary">
            <div className="timeline-marker is-primary"></div>
            <div className="timeline-content">
                <p className="heading">January 2016</p>
                <p className="">Timeline content - Can include any HTML element</p>
            </div>
        </div>
        <div className="timeline-item is-warning">
            <div className="timeline-marker is-warning is-image is-32x32">
                <img src="http://bulma.io/images/placeholders/32x32.png"></img>
            </div>
            <div className="timeline-content">
                <p className="heading">February 2016</p>
                <p className="">Timeline content - Can include any HTML element</p>
            </div>
        </div>
        <header className="timeline-header">
            <span className="tag is-primary">2017</span>
        </header>
        <div className="timeline-item is-danger">
            <div className="timeline-marker is-danger is-icon">
                <i className="fa fa-flag"></i>
            </div>
            <div className="timeline-content">
                <p className="heading">March 2017</p>
                <p className="">Timeline content - Can include any HTML element</p>
            </div>
        </div>
        <header className="timeline-header">
            <span className="tag is-medium is-primary">End</span>
        </header>
    </div>

);
export const Timeline = funcAsComponentClass<ITimelineProps, ITimelineProps>(timeline);
interface IDialogPanelProps extends IPanelProps {
    id: string;
}
interface IDialogPanelState {

}
export class DialogPanel extends BaseComponent<IDialogPanelProps, IDialogPanelState>{
    render() {
        return (null)
    }
}
export { DataList, GridColumn } from './data-list';
export { DataForm, DataPanel } from './data-form';

