import * as OrganicUIMod from './organicUI';
import * as Components from "bloomer";
import { View, funcAsViewClass, ViewWithFluentAPI } from "./lib/view";
import { ActionManager } from "./lib/action-manager";


import * as UiKit from './lib/ui-kit';
import * as  FabricUiMod from 'office-ui-fabric-react';
import * as  ReactMod from 'react';
import * as  ReactDomMod from 'react-dom';
import * as LRU_mod from 'lru-cache';
declare global {

  export type CustomValidationResult = (data: any) => IDataFormAccessorMsg[];
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
  export interface ICRUDActionsForSingleView<T> {
    handleCreate(entity: T): ActionResult;
    handleRead(id): Promise<T>;
    handleUpdate(id, entity: T): ActionResult;
    handleDelete(id): ActionResult;
    getId?(entity: T): any;
    customActions?:
    {
      queries?: { [key: string]: Function },
      record?: { [key: string]: Function },
      multipleRecords?: { [key: string]: Function }
    }

  }

  export const FabricUI: typeof FabricUiMod;
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

  export interface IViewsForCRUD<TDTO> extends ICRUDActionsForSingleView<TDTO> {
    renderSingleView(formData: TDTO): React.ReactElement<any>;
    renderListView(): React.ReactElement<any>;
    //getDataListHeight? (): number;
    getUrlForSingleView?(id?): string;
    getUrlForListView?(): string;

  }
  export interface ICRUDAction {
    actionName: string;
    onExecute: Function;
  }
  export interface IActionsForCRUD<TDto> {
    handleCreate: (dto: TDto) => Promise<any>;
    handleUpdate: (id: any, dto: TDto) => Promise<any>;
    handleDelete: (id: any) => Promise<any>;
    handleRead: (id: any) => Promise<TDto>;
    handleLoadData: (params) => PromisedResultSet<TDto>;
    getDefaultValues?: () => TDto;
    getUrlForSingleView?(id: string): string;
    customValidation?: (data: any) => IDataFormAccessorMsg[];

  }
  export interface Ioptions {
    insertButtonContent?: any;
    singularName: string;
    routeForSingleView: string;
    routeForListView: string;
    pluralName: string;
    iconCode: string;
  }
  interface IListViewParams {
    isPopup?: boolean;
  }
  interface ISingleViewParams { id }
  type StatelessListView = React.SFC<IListViewParams>;
  type StatelessSingleView = React.SFC<ISingleViewParams>;
}

