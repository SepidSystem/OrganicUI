
import * as React from 'react';
import * as ReactDOM from 'react-dom';
// Microsoft Office 365 UI

import * as LRU from 'lru-cache';
 
export function assignVendors() {
    Object.assign(window, { LRU });
    Object.assign(window, { React, ReactDOM });
   
}