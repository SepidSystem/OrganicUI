/// <reference path="../core.d.ts" />   

import { routeTable, showIconText } from "../core";

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
