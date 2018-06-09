/// <reference path="../organicUI.d.ts" />

import { BaseComponent } from './base-component';
import { templates, icon, i18n } from './shared-vars';
import { Utils } from './utils';

import { View } from './view';
import { Field } from './data';
import { listViews } from './shared-vars';
import { ReactElement, isValidElement } from 'react';
import { IDataListProps, DataList } from './data-list';
import { DataForm } from './data-form';
import { Spinner } from './spinner';
import { AdvButton, Placeholder } from './ui-kit';

import { isDevelopmentMode, DevFriendlyPort } from './developer-friendly';
const { OverflowSet, SearchBox, DefaultButton, css } = FabricUI;

interface SingleViewBoxState { formData: any; validated: boolean; }
function loadScript(url) {
    //url is URL of external file, implementationCode is the code
    //to be called from the file, location is the location to 
    //insert the <script> element

    var scriptTag = document.createElement('script');
    scriptTag.src = url;

    scriptTag.onload = () => 0;
    document.head.appendChild(scriptTag);
}
interface OrganicBoxProps<TActions, TOptions, TParams> {
    actions: TActions;
    options: TOptions;
    params: TParams;
    children?: React.ReactNode;
}
export default class OrganicBox<TActions, TOptions, TParams, S> extends BaseComponent<OrganicBoxProps<TActions, TOptions, TParams>, S> {
    serverChanged(): any {
        const boards = Array.from(document.querySelectorAll('#dev-server-board'));
        boards.forEach(board => {
            board.classList.add('active');
            board.innerHTML = 'server files is changed, building bundle started...';
        });
    }
    webSocket: WebSocket;

    private reloadAllTargetedItems() {

        const boards = Array.from(document.querySelectorAll('#dev-server-board'));
        boards.forEach(board => board.classList.remove('active'));
        setTimeout(() => location.reload(), 200);
        localStorage.setItem('stableState', JSON.stringify(this.state));
        /*   Array.from(document.querySelectorAll('script'))
               .filter(scriptElement => scriptElement.getAttribute('data-target') == 'development')
               .forEach(({ src }) => loadScript(src));
   */

    }

    constructor(p) {
        super(p);
        const stableState = localStorage.getItem('stableState')
        if (stableState) {
            localStorage.removeItem('stableState');
            const state = JSON.parse(stableState)

            setTimeout(() => this.setState(state), 100);
            console.log({ state });
        }
        if (isDevelopmentMode()) {
            try {
                this.webSocket = new WebSocket(`ws://${location.host}/watch`);
                this.webSocket.onmessage = ({ data }) => {
                    data = JSON.parse(data);

                    (data == 'reloadAllTargetedItems' && this.reloadAllTargetedItems()) ||
                        (data == 'serverChanged' && this.serverChanged())
                };
            } catch (exc) { }
        }
    }
} 