import { AnchorHTMLAttributes } from 'react';
import { mountViewToRoot } from './bootstrapper';
export function Anchor(p: AnchorHTMLAttributes<any>) {
    return <a {...p} onClick={e => {
        e.preventDefault();
        history.pushState(null, null, (e.target as HTMLAnchorElement).href);
        mountViewToRoot();
    }}>{p.children}</a>
}