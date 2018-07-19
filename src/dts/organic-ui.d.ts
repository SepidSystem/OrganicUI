
/// <reference path="../dts/globals.d.ts" />


declare namespace OrganicUi {
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
    export interface IBindableElement {
        tryToBinding();
    }
    export interface IComponentRefer<T=any> {
        componentRef: T;
    }
    export class BaseComponent<P, S=any> extends React.Component<P, S>{
        props: P;
        state: S;
        autoUpdateState: PartialFunction<S>;
        nodeByRef<T = any>(refName: string): T;
        repatch(delta: Partial<S> & { debug?}, target?);
        querySelectorAll<T=any>(cssSelector: string, target?: HTMLElement): T[];
        setPageTitle(title);
        renderErrorMode(title, subtitle);
        evaluate<T>(args: string | { refId }, cb: (ref: T) => any);
        defaultState(delta: Partial<S>);
    }
    export function CriticalContent(p: { permissionKey: string, children?}): JSX.Element;

    interface IFieldMessage {
        type: 'info' | 'success' | 'danger';
        message: string;
        by?: string;
    }
    export interface IFieldProps {
        accessor?: string;
        operators?: any[];
        onGet?, onSet?: Function;
        onErrorCode?: (v: any) => ErrorCodeForFieldValidation;
        onRenderCell?: (item?: any, index?: number, column?: any) => any;
        label?: any;
        icon?: any;
        required?: boolean;
        readonly?: boolean;
        messages?: IFieldMessage[];
        onlyInput?: boolean;
        getInfoMessage?: () => string;
        children?: any;
        className?: string;
    }

    export interface IAdvSectionProps extends React.HTMLAttributes<any> {

        errorMessage: any;
        onActionExecute?: (actionName: string) => void;
        onCloseMessage: () => void
    }
    export interface FilterItem {
        op: string;
        value: string;
        value2?: string;
        values?: string[];
        fieldName: string;
    }
    interface UtilsIntf {
        classNames(...args: string[]): string;
        coalesce(...args: any[]): any;
        navigate(url);
        debounce(func, wait, immediate?);
        makeWritable(root: HTMLElement);
        makeReadonly(root: HTMLElement);
        setIconAndText(code: string, iconCode: string, text?: string);
        showIconText(textId);
        showIconAndText(textId);
        scrollTo(element, to, duration);
        i18nFormat(i18nCode, args);
        showIcon(icon: string, className?: string);
        defaultGetId: ({ id }) => any;
        setNoWarn(v);
        warn(...args);
        renderDevButton(targetText, target: IDeveloperFeatures),
        accquireDevPortId();
        renderButtons(methods: TMethods, opts?: { componentClass?: React.ComponentType, callback?: Function });
        reduceEntriesToObject(data: any): any;
        limitValue(value: number, opts: { min?, max?}): number;

        simulateClick(elem);
        merge<T>(...args: Partial<T>[]): T;
        toArray(arg): any[];
        sumValues(numbers: number[]);
        clone<T>(x: T): T;
        uniqueArray<T>(array: T[])
        validateData<T>(data: T, callbacks: OrganicUi.PartialFunction<T>): OrganicUi.IDataFormAccessorMsg[];
        assignDefaultValues<T>(data: T, defaultValues: Partial<T>)
        skinDeepRender<T>(type: React.ComponentType<T>, params: T): JSX.Element;
        scanElement(element: React.ReactElement<any>, tester: (element) => boolean): JSX.Element;
    }
    export const Utils: UtilsIntf;
    export const changeCase: { camelCase: Function, snakeCase: Function, paramCase: Function };
    export class Field extends BaseComponent<IFieldProps, any>{
        getFilterItem(): FilterItem;
        getErrorMessage();
        revalidate();
        getTextReader();
    }
    export interface IRegistry<T=any> {
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


    export class Menu implements IMenu {
        id: number;
        title: string;
        routerLink: string;
        href: string;
        icon: string;
        target: string;
        hasSubMenu: boolean;
        parentId: number;
        constructor(id: number,
            title: string,
            routerLink: string,
            href: string,
            icon: string,
            target: string,
            hasSubMenu: boolean,
            parentId: number);
    }

    export const i18n: IRegistry<React.ReactNode>;
    export const routeTable: IRegistry<any>;
    export function i18nAttr(key: string): string;
    export const icon: IRegistry<any>;
    export const editorByAccessor: IRegistry<React.ReactElement<any>>;
    export const menuBar: IRegistry<string | Function>;
    // export const appModules = IRegistry<IAppModule>();

    //--- for businness application & admin panels

    export const tags: IRegistry<any>;
    export const reports: IRegistry<any>;
    export const dashboardBlocks: IRegistry<any>;
    export const acl: IRegistry<boolean>;
    export interface OrganicBoxProps<TActions, TOptions, TParams> {
        actions: TActions;
        options: TOptions;
        params: TParams;
        customActions?: Partial<TActions>;
        children?: React.ReactNode;
    }
    class OrganicBox<TActions, TOptions, TParams, S> extends BaseComponent<OrganicBoxProps<TActions, TOptions, TParams>, S> {
        devPortId: number;
        actions: TActions;

        constructor(p: OrganicBoxProps<TActions, TOptions, TParams>);
    }
    export class SingleViewBox<T> extends OrganicBox<
        IActionsForCRUD<T>, IOptionsForCRUD, ISingleViewParams, any> {
        getId(row): any;
        getFormData(): T;
        setFieldValue(fieldName: string, value);
    }
    export function ListViewBox<T>(p: OrganicBoxProps<IActionsForCRUD<T>, IOptionsForCRUD, IListViewParams>): JSX.Element;
    interface ComboBoxProps {
        value?: any;
        onChange?: any;
        items: { Id, Name }[];
    }
    export const ComboBox: React.SFC<ComboBoxProps>;
    export const TimeEdit: React.SFC<ITimeEditProps>;

    export interface IDataListProps {
        itemHeight?: number;
        onLoadRequestParams?: Function;
        loader?: (req: IDataListLoadReq) => Promise<IListData>;
        onDoubleClick?: () => void;
        onCurrentRowChanged?: (row: any) => any;
        rowCount?: number;
        paginationMode?: 'paged' | 'scrolled';
        template?: string;
        height?: number;
        minWidth?: number;
        popupForActions?: React.ReactNode | Function;
        onRowClick?: (rowIdx: number, row: any) => void;
        rowSelection?: any;
        templatedApplied?: boolean;
        corner?: any;
        children?: any | any[];
    }
    export const DataList: React.SFC<IDataListProps>;
    interface IDataPanelProps {
        header: any;
        primary?: boolean;
        editable?: boolean;
        className?: string;
    }
    export const DataPanel: React.SFC<IDataPanelProps>;
    export interface ICRUDAction {
        actionName: string;
        onExecute: Function;
    }
    export interface IActionsForCRUD<TDto> {
        mapFormData?: (dto: TDto) => TDto;
        beforeSave?: (dto: TDto) => TDto;
        create: (dto: TDto) => Promise<any>;

        update: (id: any, dto: TDto) => Promise<any>;
        deleteList: (hid: any[]) => Promise<any>;
        read: (id: any) => Promise<TDto>;
        readList: (params: IAdvancedQueryFilters) => PromisedResultSet<TDto>;
        getDefaultValues?: () => TDto;
        getUrlForSingleView?(id: string): string;
        validate?: (data: any) => IDataFormAccessorMsg[];
        getText?: (dto: TDto) => string;
        getId?: (dto: TDto) => any;
        getPageTitle?: (dto: TDto) => string;
    }
    type PartialFunction<T> = {
        [P in keyof T]?: (value: T[P]) => any;
    };
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
        selectedId?: any;
        corner?: any;
        onSelectionChanged?: Function;
        defaultSelectedValues?: () => any[];
        getValue?: () => any;
        setValue?: (value) => void;
        dataLookup?: any;

    }
    export interface ISingleViewParams { id }
    export type StatelessListView = React.SFC<IListViewParams>;
    export type StatelessSingleView = React.SFC<ISingleViewParams>;

    export interface IAppModule {
        getIcon?: () => React.ReactNode;
        getText?: () => React.ReactNode;
        link?: Function | string;
    }
    export interface ITreeListNode {
        text, key, parentKey, isLeaf?, type, extraValue?;
        expaneded?: boolean
    }
    export interface ITreeListProps {
        value?: ITreeListNode[];
        onChange?: (nodes) => any;
        height: number;
        nodes: ITreeListNode[];

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
    export function isProdMode(): boolean;
    export interface IFieldReaderWriter {

        onFieldWrite?, onFieldRead?: Function;
        accessor?: string;
    }
    export type ErrorCodeForFieldValidation = string;
    export type onErrorCodeResult = (data: any) => OrganicUi.IDataFormAccessorMsg[];
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
    export interface IAdvancedQueryFilters {
        fromRowIndex: number;
        toRowIndex: number;
        filterModel: any[];
        sortModel: any[];
    }
    export type OptionsForRESTClient = (() => any) | any;
    function restClient<T={}>(method: 'GET' | 'POST' | 'PUT' | 'HEAD' | 'PATCH' | 'DELETE', url: string, data?): Promise<T>;

    export interface IAppModel {
        getMenuItems(): { menu: IMenu }[];
        defaultMasterPage: () => any;
    }
    export function startApp(appModel: IAppModel);
    export interface ITimeSlotRange { from: string, to: string }
    export interface ITimeSlotProps {
        ranges: ITimeSlotRange[];
        prefix?: React.ReactNode;
        onChange: (ranges: ITimeSlotRange[]) => void;
    }
    export interface IDataListLoadReq {
        startFrom: number;
        rowCount: number;

    }
    export interface IDataListProps {
        itemHeight?: number;
        onLoadRequestParams?: Function;
        loader?: (req: IDataListLoadReq) => Promise<IListData>;
        onDoubleClick?: () => void;
        onCurrentRowChanged?: (row: any) => any;
        rowCount?: number;
        paginationMode?: 'paged' | 'scrolled';
        template?: string;
        height?: number;
        minWidth?: number;
        popupForActions?: React.ReactNode | Function;
        onRowClick?: (rowIdx: number, row: any) => void;
        rowSelection?: any;
        templatedApplied?: boolean;
        corner?: any;
        children?: any | any[];
    }
    interface DataListPanelProps extends Partial<IDataPanelProps> {

        formMode?: 'modal' | 'callout' | 'panel' | 'section';
        dataListHeight?: number;
        avoidAdd?, avoidDelete?, avoidEdit?: boolean;
        customBar?: TMethods;
        accessor?: string;
        onErrorCode?: onErrorCodeResult;
        singularName?, pluralName?: string;
        style?: React.CSSProperties;
    }
    export const DataListPanel: React.SFC<DataListPanelProps>;

    interface DataLookupProps {
        source: StatelessListView;
        className?: string;
        onChange?: (value) => void;
        onFocus?: () => void;
        onDisplayText?: (value) => React.ReactNode;
        multiple?: boolean;
        value?: any;
        iconCode?: string;
        minHeightForPopup?: string;
    }
    export const DataLookup: React.SFC<DataLookupProps>;
    export class TreeList extends BaseComponent<ITreeListProps, any>{ }

    interface IAdvButtonProps {
        children?: any;
        isLoading?: boolean;
        callout?: any;
        primary?: boolean;

        onClick?: () => any;
        fixedWidth?: boolean;
        className?: string;
        calloutWidth?: number;
        lastMod?: number;
        buttonComponent?: any;
        fullWidth?: boolean;
        href?: string;
        mini?: boolean;
        size?: 'small' | 'medium' | 'large';
        type?: string;
        variant?: 'text' | 'flat' | 'outlined' | 'contained' | 'raised' | 'fab';
        color?: 'inherit' | 'primary' | 'secondary' | 'default';

    }
    export const AdvButton: React.SFC<IAdvButtonProps>;
    // Custom Components for  SepidSystem Company 
    export const TimeSlot: React.SFC<ITimeSlotProps>;
    interface IDialogProps {
        title?, content?: any;
        actions?: { [key: string]: Function }
        defaultValues?: any;
    }
    interface AppUtilsIntf {
        (p: any): JSX.Element;
        showDialog(content, opts?: IDialogProps): void;
        confrim(content, opts?: IDialogProps): Promise<any>;
        confrimActionByUser(p: { actionName: string, actionData }): Promise<never>;
        showDataDialog<T>(content: React.ReactElement<Partial<IDataFormProps<T>>>, opts?: IDialogProps): Promise<T>;
    }
    export interface IMessageBarProps {
        className?: string;
        onClose?: Function;
        variant: 'success' | 'warning' | 'error' | 'info';
        children?: any;
    }
    export interface ITimeEditProps {
        value?: string;
        keepSeconds?: boolean;
        onChange?: React.ChangeEventHandler<HTMLInputElement>;
    }
    export const AppUtils: AppUtilsIntf;
}

declare module '@organic-ui' {

    export type TMethods = OrganicUi.TMethods;

    export const Utils: typeof OrganicUi.Utils;
    export const AppUtils: typeof OrganicUi.AppUtils;
    export const DataLookup: typeof OrganicUi.DataLookup;
    export const TreeList: typeof OrganicUi.TreeList;
    export const i18n: typeof OrganicUi.i18n;
    export const routeTable: typeof OrganicUi.routeTable;
    export type IFieldProps = OrganicUi.IFieldProps;
    export const Field: typeof OrganicUi.Field;
    export type IAppModel = OrganicUi.IAppModel;
    export const startApp: typeof OrganicUi.startApp;

    export type Menu = OrganicUi.Menu;
    export const Menu: typeof OrganicUi.Menu;
    export type IActionsForCRUD<TDto> = OrganicUi.IActionsForCRUD<TDto>;
    export type IOptionsForCRUD = OrganicUi.IOptionsForCRUD;
    export { AxiosRequestConfig as RequestConfig } from 'axios';
    import { AxiosRequestConfig } from 'axios';
    import { AnchorHTMLAttributes } from 'react';
    export const JssProvider: any;
    export function scanAllPermission(table: { data }): Promise<ITreeListNode[]>;
    import * as FabricUI from 'office-ui-fabric-react';
    export { FabricUI };
    export type StatelessSingleView = OrganicUi.StatelessSingleView;
    export type StatelessListView = OrganicUi.StatelessListView;
    export type IAdvancedQueryFilters = OrganicUi.IAdvancedQueryFilters;
    export interface OptForRESTClient extends Partial<AxiosRequestConfig> {
        title: string;
    }
    export const appData: {
        appModel?: IAppModel

    }
    export type OptionsForRESTClient = (() => Partial<OptForRESTClient>) | OptForRESTClient;
    export const createClientForREST: (options?: OptionsForRESTClient) => typeof restClient;
    function restClient<T={}>(method: 'GET' | 'POST' | 'PUT' | 'HEAD' | 'PATCH' | 'DELETE', url: string, data?): Promise<T>;
    export type ResultSet<T> = OrganicUi.ResultSet<T>;
    export type ErrorCodeForFieldValidation = OrganicUi.ErrorCodeForFieldValidation;
    export type IDataFormAccessorMsg = OrganicUi.IDataFormAccessorMsg;
    export type PromisedResultSet<T> = OrganicUi.PromisedResultSet<T>;
    export type ActionResult = Promise<any>;
    export type IListData<TRow=any> = OrganicUi.IListData;
    interface IBindableElement {
        tryToBinding();
    }
    export type IComponentRefer<T=any> = OrganicUi.IComponentRefer;
    export class BaseComponent<P, S> extends OrganicUi.BaseComponent<P, S>{ }
    export const ViewBox: React.SFC<OrganicUi.OrganicBoxProps<any, any, any>>;
    export const DashboardBox: React.SFC<OrganicUi.OrganicBoxProps<any, any, any>>;
    export type SingleViewBox<T=any> = OrganicUi.SingleViewBox<T>;
    export const SingleViewBox: typeof OrganicUi.SingleViewBox;
    export type IListViewParams = OrganicUi.IListViewParams;
    export type ISingleViewParams = OrganicUi.ISingleViewParams;
    export const ListViewBox: typeof OrganicUi.ListViewBox;
    export const ReportViewBox: React.SFC<OrganicUi.OrganicBoxProps<any, any, any>>;
    export const Anchor: React.SFC<AnchorHTMLAttributes<any>>;
    export const DatePicker: React.SFC<any>;
    export const ComboBox: typeof OrganicUi.ComboBox;
    export const TimeEdit: typeof OrganicUi.TimeEdit;
    export const AdvButton: typeof OrganicUi.AdvButton;
    export const DataForm: React.SFC<OrganicUi.IDataFormProps>;
    export const DataList: typeof OrganicUi.DataList;
    export const DataPanel: typeof OrganicUi.DataPanel;
    export const DataListPanel: typeof OrganicUi.DataListPanel;
    export const i18nAttr: typeof OrganicUi.i18nAttr;
    export const icon: typeof OrganicUi.icon;
    export const editorByAccessor: typeof OrganicUi.editorByAccessor;
    export const menuBar: typeof OrganicUi.menuBar;
    export type ITreeListNode = OrganicUi.ITreeListNode;
    export type ITreeListProps = OrganicUi.ITreeListProps;
    export type CustomTesterForRegistry = OrganicUi.CustomTesterForRegistry;
    export type IDeveloperFeatures = OrganicUi.IDeveloperFeatures;
    export type IAdvSectionProps = OrganicUi.IAdvSectionProps;
    export const isProdMode: typeof OrganicUi.isProdMode;
    export type ITimeEditProps = OrganicUi.ITimeEditProps;
    export type IMessageBarProps = OrganicUi.IMessageBarProps;
    export function createGenerateClassName(p: any);
    export function Collapsible(p: any);
    export const DeveloperBar: React.SFC<any>;
    // SepidSystem
    export type ITimeSlotRange = OrganicUi.ITimeSlotRange;
    export const TimeSlot: typeof OrganicUi.TimeSlot;
    // export const appModules = IRegistry<IAppModule>();

    //--- for businness application & admin panels

    export const tags: typeof OrganicUi.tags;
    export const reports: typeof OrganicUi.reports;
    export const dashboardBlocks: typeof OrganicUi.dashboardBlocks;
    export const acl: typeof OrganicUi.acl;
    // decorators
    function decoSubRender(target: any, propertyName: string, descriptor: TypedPropertyDescriptor<Function>)
    export function SubRender(): typeof decoSubRender;

    //   Inspired Components;
    export { TextField, Checkbox, Select, Button,RadioGroup,FormControlLabel } from '@material-ui/core';
    export {Callout} from 'office-ui-fabric-react';
}
