import * as OrganicUIMod from './organicUI';
import * as Components from "bloomer";

import * as UiKit from './lib/ui-kit';
import * as  FabricUiMod from 'office-ui-fabric-react';
import * as  MaterialUiMod from '@material-ui/core';

import * as  ReactMod from 'react';
import * as  ReactDomMod from 'react-dom';
import * as LRU_mod from 'lru-cache';
import { AxiosRequestConfig } from 'axios';
declare global {

  export type onErrorCodeResult = (data: any) => IDataFormAccessorMsg[];
  export type FuncView<S, AC> = (props: any, state: S, repatch: (delta, target?) => void, actions: AC) => React.ReactNode;
  export type FuncComponent<P, S> = (p: P, s: S, repatch: (delta, target?) => void) => React.ReactNode;

  export interface ResultSet<T> {
    results: T[];
  }
  export interface IDataFormAccessorMsg {
    accessor: string;
    message: any;
  }
  export interface PromisedResultSet<T> extends Promise<IListData<T>> {

  }
  export interface ActionResult extends Promise<any> {

  }
  export interface IListData<TRow=any> {
    totalRows: number;
    rows: TRow[];

  }
  interface IBindableElement {
    tryToBinding();
  }
  interface IComponentRefer<T=any> {
    componentRef: T;
  }
  export type PureView<TState, TAPI> =
    (state: TState, api?: TAPI, discover?, repatch?: (delta, target?) => void) => React.ReactNode;

  export const FabricUI: typeof FabricUiMod;
  export const MaterialUI: typeof MaterialUiMod;
  export const React: typeof ReactMod;
  export const ReactDOM: typeof ReactDomMod;

  export const OrganicUI: typeof OrganicUIMod;

}
declare module Array {
  export var joinNotEmpty: Function;
}
declare global {
  export const ReactDataGrid: any;
  export const LRU: any;

   
  export interface ICRUDAction {
    actionName: string;
    onExecute: Function;
  }
  export interface IActionsForCRUD<TDto> {
    mapFormData?: (dto: TDto) => TDto;
    beforeSave?: (dto: TDto) => TDto;
    handleCreate: (dto: TDto) => Promise<any>;

    handleUpdate: (id: any, dto: TDto) => Promise<any>;
    handleDeleteList: (id: any[]) => Promise<any>;
    handleRead: (id: any) => Promise<TDto>;
    handleReadList: (params: IAdvancedQueryFilters) => PromisedResultSet<TDto>;
    getDefaultValues?: () => TDto;
    getUrlForSingleView?(id: string): string;
    onErrorCode?: (data: any) => IDataFormAccessorMsg[];
    getText?: (dto: TDto) => string;
    getId?: (dto: TDto) => any;
    getPageTitle?: (dto: TDto) => string;
  }
  export interface IOptionsForCRUD {
    insertButtonContent?: any;
    singularName: string;
    routeForSingleView: string;
    routeForListView: string;
    pluralName: string;
    iconCode: string;
  }
  interface IListViewParams {
    forDataLookup?: boolean;
    multipleDataLookup?: boolean;
    height?: number;

    corner?: any;
    onSelectionChanged?: Function;
  }
  interface ISingleViewParams { id }
  type StatelessListView = React.SFC<IListViewParams>;
  type StatelessSingleView = React.SFC<ISingleViewParams>;

  export interface IAppModule {
    getIcon?: () => React.ReactNode;
    getText?: () => React.ReactNode;
    link?: Function | string;
  }
  export interface ITreeListNode {
    text, key, parentKey, isLeaf?, type;
    expaneded?: boolean
  }
  export interface IRegistry<T> {
    data: any;
    secondaryValues: any;
    notFounded: any;
    (key: string): T;
    (key: string, value: T): void;
    register(delta: { [key: string]: T }): void;
    set(key: string, value: T, extraValue?);
    get(key: string): string;
    customTester(v: CustomTesterForRegistry, value: T);
  }
  export type CustomTesterForRegistry = (key: string) => boolean | string | RegExp;
  export interface IDeveloperFeatures {
    devElement: any;
    devPortId: any;
    forceUpdate(): void;
    getDevButton(): JSX.Element;
  }
  export interface IFieldReaderWriter {

    onFieldWrite?, onFieldRead?: Function;
    accessor?: string;
  }
  export interface IDataFormProps<T=any> extends IFieldReaderWriter {
    validate?: boolean;
    onErrorCode?: onErrorCodeResult;
    data?: T;
    className?: string;
  }
  export type TMethods = Function[] | { [key: string]: Function }
  export interface IMenu {
    id: number;
    title: string;
    routerLink: string;
    href: string;
    icon: string;
    target: string;
    hasSubMenu: boolean;
    parentId: number;
  }
  interface IAdvancedQueryFilters {
    FromRowIndex: number;
    ToRowIndex: number;
    FilterModel: any[];
    SortModel: any[];
  }
  export type refetchFactoryOptions = (() => Partial<AxiosRequestConfig>) | Partial<AxiosRequestConfig>
  export interface IAppModel {
    getMenuItems(): { menu: IMenu }[];
    defaultMasterPage: () => any;
  }
}
