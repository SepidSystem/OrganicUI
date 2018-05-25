import * as React from "react";
import { icon, i18n, funcAsComponentClass, showIconText, showIconAndText } from "../../organicUI";
declare const h: any;
const { DropDownButton } = require('./index');
interface IErrorBoxProps {
    title: any;
    data?: Object;
}
function errorBox(p: IErrorBoxProps) {
    const selectedProp = !!p.data && Object.keys(p.data)[0];
    return <div className="notifaction">
        <div className="title is-4">{p.title}</div>
        <div className="">
        </div>
        <div className="media">
            <div className="media-left"><DropDownButton /></div>
            <div className="media-content">{i18n(selectedProp)}</div>
            <div className="media-right">
                <button className="button is-text"><i className="fa-chevron-left"></i></button>
                <button className="button is-text"><i className="fa-chevron-right"></i></button>
            </div>
        </div>
    </div>
}
interface IBoxProps {
    header?: any;
    actions: any;
    children?: any;
}
export function ActionBox(p: IBoxProps) {
    return <div className="box">
        {!!p.header && <header className="box-header">{p.header}</header>}
        {!!p.header && <hr />}
        {p.children}
        <footer className="box-footer columns">
            <a className="button is-text column is-1">
                {icon('settings')}
            </a>
            <div className="primary-actions column"></div>
            <div className="column is-1">
                <DropDownButton actions={p.actions} />
            </div>
        </footer>
    </div>
}