/// <reference path="../organicUI.d.ts" />
 

const { tags, reports } =OrganicUI;
import './default-layout';
import './frontend/customer-view';

reports.set('report1', null);
reports.set('report2', null);
reports.set('report3', null);
reports.set('report4', null); 


window.addEventListener('DOMContentLoaded', () => OrganicUI.startApp());