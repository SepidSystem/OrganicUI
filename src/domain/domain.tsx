/// <reference path="../dts/globals.d.ts" />
/// <reference path="../dts/organic-ui.d.ts" />

import './frontend/sepid-rest-api';
import './frontend/boot';
import './frontend/editors';
import './frontend/login-view';
import './frontend/dashboard-view';
import './frontend/user-group-view';
import './frontend/department-view';
import './frontend/user-view';
import './frontend/role-view';
import './frontend/dataitemgroup-view';
import './frontend/device-view';
import './frontend/schedules-view';
import './frontend/access-group-view';
import './frontend/employee-view';
import './frontend/attendancelive-report';
import './frontend/attendance-report';
import './frontend/eventlogs-report';
import './frontend/employeetemplates-report';
import AppModel from './frontend/app-model';
window.addEventListener('DOMContentLoaded', () => OrganicUI.startApp(new AppModel()), { once: true });