/// <reference path="../dts/globals.d.ts" />

import { BaseComponent } from './base-component';
import { Utils } from './utils';


export interface OrganicBoxProps<TActions, TOptions, TParams> {
    actions?: TActions;
    options?: TOptions;
    params: TParams;
    customActions?: Partial<TActions>;
    children?: React.ReactNode;

}
export default class OrganicBox<TActions, TOptions, TParams, S> extends BaseComponent<OrganicBoxProps<TActions, TOptions, TParams>, S> {
    static isOrganicBox() {
        return true;
    }
    static OrganicBoxCounter = 0;
    static savedStates: any;
    static saveStates() {
        const foundedBoxes = Array.from(
            document.querySelectorAll('.organic-box')).map(el => el['componentRef'] as OrganicBox<any, any, any, any>);
        return OrganicBox.savedStates =
            foundedBoxes.filter(box => box.organicBoxId)
                .reduce((a, box) => Object.assign({ [box.organicBoxId]: box.state }, a), {});
    }
    static restoreStates(states = OrganicBox.savedStates) {
        const foundedBoxes = Array.from(
            document.querySelectorAll('.organic-box')).map(el => el['componentRef'] as OrganicBox<any, any, any, any>);
        foundedBoxes.forEach(box => box.repatch(states[box.organicBoxId] || {}));

    }
    organicBoxId: string;
    devPortId: number;
    actions: TActions;
    showDevBoard(msg): any {
        const boards = Array.from(document.querySelectorAll('#dev-server-board'));
        boards.forEach(board => {
            board.classList.add('active');
            board.innerHTML = msg;
        });
    }

    serverChanged() {
        this.showDevBoard('server files is changed, building bundle started...');

    }
    webSocket: WebSocket;


    static instanceCounter = 0;
    static isOrganicBoxTester = (el: JSX.Element) =>
        (el.type) && (el.type as any).isOrganicBox instanceof Function &&
        (el.type as any).isOrganicBox();
    static extractOrganicBoxFromComponent<T>(componentType: React.ComponentType<T>) {
        const element = Utils.skinDeepRender(componentType, {});
        let { organicBox } = componentType as any;
        if (organicBox) return organicBox;
        organicBox = Utils.queryElement(element, this.isOrganicBoxTester);
        Object.assign(element.type, { organicBox });
        return organicBox;
    }
    constructor(p: OrganicBoxProps<TActions, TOptions, TParams>) {
        super(p);
        this.actions = Object.assign({}, p.actions, p.customActions || {});
        this.devPortId = Utils.accquireDevPortId();
        this.organicBoxId = 'organic-' + (++OrganicBox.OrganicBoxCounter);
        /*const stableState = localStorage.getItem('stableState')
        const counter = OrganicBox.instanceCounter++;
        
                if (stableState && counter == 0) {
                    // localStorage.removeItem('stableState');
                    const state = JSON.parse(stableState)
        
                    setTimeout(() => this.setState(state), 100);
        
        
                    const willReload = +localStorage.getItem('will-reload');
                    if (!!willReload) {
                        localStorage.removeItem('will-reload');
                        localStorage.setItem('stableState', JSON.stringify(this.state));
        
                        this.showDevBoard('forced reloading... ');
        
                        location.reload();
        
                    }
                }
                if (isDevelopmentEnv() && counter == 0 && false) {
                    try {
                        this.webSocket = new WebSocket(`ws://${location.host}/watch`);
                        this.webSocket.onmessage = ({ data }) => {
                            data = JSON.parse(data);
        
                            (data == 'reloadAllTargetedItems' && this.reloadAllTargetedItems()) ||
                                (data == 'serverChanged' && this.serverChanged())
                        };
                    } catch (exc) { }
                } */
    }
}
