/// <reference path="../organicUI.d.ts" />   

import { routeTable, showIconText } from "../organicUI";

import { View } from "../lib/view";
declare const React: any;

class SettingsView extends View<any, any> {
    renderContent() {
        return <div className="container">

        </div >;

    }
}
routeTable.set('/view/settings', SettingsView);
routeTable.set('/view/settings/:name', SettingsView);
