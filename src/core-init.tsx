import * as React from 'react';
Object.assign(window, { React });
import * as Core from './core'
Object.assign(window, { Core,FabricUI:Core.FabricUI });

import { View, ViewWithFluentAPI } from "./lib/view";

import * as Components from "bloomer";
import * as  Data from "./lib/data";
import { ActionManager } from './lib/action-manager';

Object.assign(Core, { Components, ActionManager, View, ViewWithFluentAPI, Data });
import * as UiKit from './lib/ui-kit';
Object.assign(Core, { UiKit });


