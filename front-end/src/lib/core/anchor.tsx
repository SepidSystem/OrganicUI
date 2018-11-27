import { AnchorHTMLAttributes } from 'react';
import { mountViewToRoot } from './bootstrapper';
import { Utils } from './utils';
export function Anchor(p: AnchorHTMLAttributes<any>) {
    return <a {...p} onClick={e => {
        e.preventDefault();
        const href = (e.target as HTMLAnchorElement).href;
        Utils.navigate(href);
        mountViewToRoot();
    }}>{p.children}</a>
}