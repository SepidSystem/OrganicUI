
import * as React from 'react';
import * as ReactDOM from 'react-dom';
Object.assign(window, { React, ReactDOM });
// Microsoft Office 365 UI
import * as FabricUI from 'office-ui-fabric-react'
Object.assign(window, { FabricUI });
import * as MaterialUI from '@material-ui/core';
   
Object.assign(window, { MaterialUI });
    
import * as ReactDataGrid from 'react-data-grid';
Object.assign(window, { ReactDataGrid });
  
import * as LRU from 'lru-cache';
Object.assign(window, { LRU });

FabricUI.TextField.defaultProps.suffix = ' '; 
