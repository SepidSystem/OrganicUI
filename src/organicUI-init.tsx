import * as React from 'react';
Object.assign(window, { React });
import * as OrganicUI from './organicUI'
Object.assign(window, { OrganicUI,FabricUI:OrganicUI.FabricUI });

import { View, ViewWithFluentAPI } from "./lib/view";

import * as Components from "bloomer";
import * as  Data from "./lib/data";
import { ActionManager } from './lib/action-manager';

Object.assign(OrganicUI, { Components, ActionManager, View, ViewWithFluentAPI, Data });
import * as UiKit from './lib/ui-kit';
Object.assign(OrganicUI, { UiKit });


