/// <reference path="../organicUI.d.ts" />

import AppModel from './frontend/app-model';
const { tags, reports } = OrganicUI;
import './default-layout';
import './frontend/dashboard-view';
import './frontend/usergroup-view';
import './frontend/department-view';
import './frontend/user-view';
import './frontend/role-view';
import './frontend/dataitemgroup-view';
import './frontend/customer-view';
import './frontend/device-view';
import './frontend/employee-view';
import './frontend/attendancelive-report';
import './frontend/attendance-report';
import './frontend/eventlogs-report';
import './frontend/employeetemplates-report';
window.addEventListener('DOMContentLoaded', () => OrganicUI.startApp(new AppModel()));