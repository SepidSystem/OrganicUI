
import * as React from 'react';
import * as ReactDOM from 'react-dom';
// Microsoft Office 365 UI
import * as FabricUI from 'office-ui-fabric-react'
import * as MaterialUI from '@material-ui/core';

import * as ReactDataGrid from 'react-data-grid';

import * as LRU from 'lru-cache';
export function assignVendors() {
 
    Object.assign(window, { LRU });
    Object.assign(window, { React, ReactDOM });
    Object.assign(window, { FabricUI });

    Object.assign(window, { MaterialUI });

    Object.assign(window, { ReactDataGrid });

    FabricUI.TextField.defaultProps.suffix = ' ';
}