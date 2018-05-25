/// <reference path="./organicUI.d.ts" />   
const { registryFactory } = OrganicUI;
import {  } from "";

export interface IReport {

}
export { TemplateForCRUD, TemplateForCRUDProps } from './lib/platform/crud-templ';
 
export const tags = registryFactory((registeredText, key) => registeredText);
export const reports = registryFactory<() => IReport>((reportIntf, key) => reportIntf);
export const dashboardBlocks = registryFactory((registeredText, key) => registeredText);
export const acl = registryFactory<boolean>((result, key) => !!this.data.isAdmin || result);
export const listViews = registryFactory<string>();

