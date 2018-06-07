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
 
import { isDevelopmentEnv,DevFriendlyPort } from './developer-friendly';
const { OverflowSet, SearchBox, DefaultButton, css } = FabricUI;

interface SingleViewBoxState { formData: any; validated: boolean; }
function loadScript(src) {
    const script = document.createElement('script');
    script.src = src;
    document.body.appendChild(script);
    return script;
}
export default class OrganicBox<P, S> extends BaseComponent<P, S> {
    serverChanged(): any {
        const board = document.querySelector('#dev-server-board');
        board && board.classList.add('active');
        board && (board.innerHTML = 'server files is changed, building started...');

    }
    webSocket: WebSocket;
    static stableState: any;
    private reloadAllTargetedItems() {
        OrganicBox.stableState = this.state;
        Array.from(document.querySelectorAll('script'))
            .filter(scriptElement => scriptElement.getAttribute('data-target') == 'development')
            .forEach(({ src }) => loadScript(src));
        OrganicUI.setAfterLoadCallback(() => {
            this.setState(OrganicBox.stableState)
            const board = document.querySelector('#dev-server-board');
            board && board.classList.remove('active');
        });
    }

    constructor(p) {
        super(p);
        if (isDevelopmentEnv()) {
            try {
                this.webSocket = new WebSocket(`ws://${location.host}/watch`);
                this.webSocket.onmessage = ({ data }) => (
                    (data == 'reloadAllTargetedItems' && this.reloadAllTargetedItems()) ||
                    (data == 'serverChanged' && this.serverChanged())
                );
            } catch (exc) { }
        }
    }
} 