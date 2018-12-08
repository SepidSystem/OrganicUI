import { AnchorHTMLAttributes } from 'react';
import { mountViewToRoot } from './bootstrapper';
import { Utils } from './utils';

export function Anchor(p: OrganicUi.AnchorProps) {
    return <a {...p} onClick={async e => {
        e.preventDefault();
        const { switchingInClass, switchingOutClass, switchingElement, switchingDelay } = p;
        const href = (e.target as HTMLAnchorElement).href;
        if (switchingInClass) {
            const targetElement: HTMLElement = (typeof switchingElement == 'string' && document.querySelector(switchingElement)) || switchingElement || document.documentElement as any;
            const targetElementIsOK: boolean = !!targetElement && !!targetElement.classList;
            console.assert(targetElementIsOK, 'switchingElement is invalid', p.switchingElement);
            if (targetElementIsOK) {
                targetElement.classList.add(switchingOutClass);
                targetElement.classList.remove(switchingInClass);
                await Utils.delay(switchingDelay);
            }
            await Utils.navigate(href);
            await mountViewToRoot();
            if (targetElementIsOK) {
                targetElement.classList.add(switchingInClass);
                await Utils.delay(switchingDelay);
                targetElement.classList.remove(switchingInClass,switchingOutClass);
            }
        }
        else {
            Utils.navigate(href);
            mountViewToRoot();
        }
    }}>{p.children}</a>
}
const defaultProps: Partial<OrganicUi.AnchorProps> = {
    switchingDelay: 250
}
Object.assign(Anchor, { defaultProps });