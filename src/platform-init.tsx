/// <reference path="./core.d.ts" />

import * as Platform from './platform'

import './lib/platform/default-layout';
import './lib/platform/crud-templ';
 
const { menuBar } = Core;
import { listViews } from './platform';
Object.assign(window, { Platform });


import './views/tags-view';
import './views/dashboard-view';
import './views/report-view';
import './views/setting-view';

menuBar.set('dashboard', `/view/dashboard`);
menuBar.set('lists', () => listViews(Object.keys(listViews.data)[0]));
menuBar.set('discover', '/view/discover');
menuBar.set('reports', '/view/reports');
menuBar.set('my-profile', '/view/me');
