
/// <reference path="../dts/globals.d.ts" />
/// <reference path="./reinvent.d.ts" />



declare namespace OrganicUi {
    export interface ResultSet<T> {
        results: T[];
    }
    export type PartialForcedType<T, FT> = {
        [P in keyof T]?: FT;
    } | (keyof T)[];
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
    export interface DatePickerProps {
        value?, hasTime?, popOverReversed?, style?: React.CSSProperties, onChange?: any;
        readonly?;
        editorPrefix?: string;
        onFocus?: () => void;
        placeholder?: string;
        onBlur?: Function;
        className?: string;
    }
    interface IContentItem<T, TActions> {
        alt: {
            itemNo: number;
            index: number;
            isLast: boolean;
            isFirst: boolean;
        };
        item: T;
        actions: TActions;
    }
    export type IContentFunction<T, TActions> = (item: IContentItem<T, TActions>) => JSX.Element;
    export interface IBindableElement {
        tryToBinding();
    }
    export interface IComponentRefer<T=any> {
        componentRef: T;
    }
    export const Version: string;
    export class BaseComponent<P=any, S=any> extends React.Component<P, S>{
        props: P;
        state: S;
        autoUpdateState: PartialFunction<S>;
        repatch(delta: Partial<S> & { debug?}, target?);
        querySelectorAll<T=any>(cssSelector: string, target?: HTMLElement): T[];
        setPageTitle(title);
        renderErrorMode(title, subtitle);
        defaultState(delta: Partial<S>);
        asyncRepatch(key: keyof S, asyncFunc: Function, ...args);
        setState<K extends keyof S>(
            state: ((prevState: Readonly<S>, props: Readonly<P>) => (Pick<S, K> | S | null)) | (Pick<S, K> | S | null),
            callback?: () => void
        ): void;

        forceUpdate(callBack?: () => void): void;
        render(): React.ReactNode;
        context: any;
        refs: {
            [key: string]: React.ReactInstance
        };
    }
    export interface CriticalContentProps { permissionValue: string; permissionKey: string; children?}
    export function CriticalContent(p: { permissionKey: string, children?}): JSX.Element;

    interface IFieldMessage {
        type: 'info' | 'success' | 'danger';
        message: string;
        by?: string;
    }
    export interface IFieldProps<TColProps=any> {
        accessor?: string | Reinvent.IBindingPoint | Reinvent.IBindingPoint[];
        role?: string;
        showOpeartors?: boolean;
        operators?: string[];
        onGet?, onSet?: Function;
        onChange?: (value) => void;
        onErrorCode?: (v: any) => ErrorCodeForFieldValidation;
        onRenderCell?: (item?: any, index?: number, column?: any) => any;
        onInitialRead?: (value: any, row: any) => void;
        label?: any;
        icon?: any;
        required?: boolean;
        readonly?: boolean;
        messages?: IFieldMessage[];
        onlyInput?: boolean;
        labelOnTop?: 'always';
        onMirror?: Function;
        getInfoMessage?: () => string;
        children?: any;
        className?: string;
        renderMode?: string;
        trueDisplayText?: string;
        falseDisplayText?: string;
        filterData?: { fieldType?, ignoreFilter?: boolean };
        sortData?: { ignoreSort?: boolean };
        avoidSort?: boolean;
        defaultOperator?: string;
        disableFixedWidth?: boolean;
        columnProps?: Partial<TColProps>;
        defaultValue?: any;
        defaultValueAllowed?: () => boolean;
        style?: React.CSSProperties;
    }

    export interface ActionsForIArrayDataViewItem {
        remove: Function;
        append: Function;
        select: Function;
    }
    export interface ITipsProps {
        tips: React.ReactNode[];
        onIgnore?: ((index: number) => (true | false));
        onDetailClick?: ((index: number) => void);
        defaultActiveTipIndex?: number;
    }
    export interface IArrayDataViewProps<T> {
        value: T[];
        onChange?: (value: T[]) => void;
        children: IContentFunction<T, ActionsForIArrayDataViewItem>;
        defaultItem?: T | (() => T);
        minCount?: number;
        className?: string;
        style?: React.CSSProperties;
    }
    export interface IAdvSectionProps extends React.HTMLAttributes<any> {
        errorMessage: any;
        onActionExecute?: (actionName: string) => void;
        onCloseMessage: () => void
    }
    export interface FilterItem {
        op: string;
        value?: string;
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
        diff(a, b): any;
        getCascadeAttribute(element: HTMLElement, attributeName: string, errorRaised?: boolean): string;
        enumToIdNames(enumType: any): ({ Id, Name }[]);
        addDays(date: Date, days: number): Date;
        numberFormat(n: string | number): string;
        hash(data): string;
        persianNumber(s: string): string;
    }
    export const Utils: UtilsIntf;
    export const changeCase: { camelCase: Function, snakeCase: Function, paramCase: Function };
    export class Field<T> extends BaseComponent<IFieldProps<T>, any>{
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
        clear();
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
        selectionLink: string;

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

    //--- for businness application & admin panels

    export const tags: IRegistry<any>;
    export const reports: IRegistry<any>;
    export const dashboardBlocks: IRegistry<any>;
    export const acl: IRegistry<boolean>;
    export interface UiKitProps {
        id: string;
    }
    export const UiKit: React.SFC<UiKitProps>;
    export interface OrganicBoxProps<TActions, TOptions, TParams> {
        actions?: TActions;
        options?: TOptions;
        params?: TParams;
        customActions?: Partial<TActions>;
        children?: React.ReactNode;
    }
    interface IActions {
        actions?: any[];
    }
    export interface IPanelProps extends IActions {
        header?: any;
        tabs?: string[];
        blocks?: any[];
        hasSearch?: boolean;
        selectedTab?: string;
        selectedBlock?: number | string;
        onSelectBlock?: (index: number) => void
        children: any;
        classNamePerChild?: string;
        onActionExecute?: (s: string) => void;
    }
    export const Panel: React.SFC<IPanelProps>;
    class OrganicBox<TActions, TOptions, TParams, S> extends BaseComponent<OrganicBoxProps<TActions, TOptions, TParams>, S> {
        devPortId: number;
        actions: TActions;

        constructor(p: OrganicBoxProps<TActions, TOptions, TParams>);
    }
    export interface ISingleViewBox<T> {
        getId(row): any;
        getFormData(): T;
        setFieldValue(fieldName: string, value);
    }
    export class ListViewBox<T> extends OrganicBox<IActionsForCRUD<T>, IOptionsForCRUD, IListViewParams, never>  {
        static fromArray<T>(items: T[], options?: { keyField, fields }): StatelessListView
    }

    export type ReportReadMethod = (params: IAdvancedQueryFilters) => PromisedResultSet<any>;
    interface IActionsForReport {
        read: ReportReadMethod;
    }

    interface ComboBoxProps {
        value?: any;
        onChange?: any;
        items: { Id, Name }[];
    }
    export const ComboBox: React.SFC<ComboBoxProps>;
    export const TimeEdit: React.SFC<ITimeEditProps>;

    export interface DataTableProps {
        height?: any;
        data: any[];
        captions: string[];
        columnsRenders: (React.ComponentType<any> & { tableCellStyle?: React.CSSProperties, tableCellProps?: React.TdHTMLAttributes<any> })[];
    }
    export const DataList: React.SFC<OrganicUi.IDataListProps<any>>;
    export const DataTreeList: React.SFC<OrganicUi.IDataListProps<any> & Partial<OrganicUi.ITreeListProps>>;
    export interface IDataGalleryProps extends IDataListProps {
        fieldMapping?: {
            key, title, description
        }
    }
    export const DataGallery: React.SFC<IDataGalleryProps>;
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
        getUrlForSingleView?(id: string): string;
        validate?: (data: any) => IDataFormAccessorMsg[];
        getText?: (dto: TDto) => string;
        getId?: (dto: TDto) => any;
        getPageTitle?: (dto: TDto) => string;
        onFieldWrite?: (key: string, value, dto: TDto) => void
    }
    type PartialFunction<T> = {
        [P in keyof T]?: ((value: T[P]) => any);
    };
    export interface IBlankOptions {
        title: string;
    }
    export interface IOptionsForCRUD {
        avoidAutoFilter?: boolean;
        insertButtonContent?: any;
        singularName: string;
        routeForSingleView: string;
        routeForListView: string;
        classNameForListView?: string;
        classNameForSingleView?: string;
        pluralName: string;
        permissionKeys?: { forCreate, forRead, forUpdate, forDelete }
        filterOptions?: {
            liveMode?: boolean;
        }
        iconCode;
    }
    interface IListViewParams {
        forDataLookup?: boolean;
        multipleDataLookup?: boolean;
        parentRefId?: number;
        isHidden?: boolean;
        height?: number;
        width?: number;
        selectedId?: any;
        corner?: any;
        onSelectionChanged?: Function;
        onPageChanged?: Function;
        customReadList?: Function;
        customReadListArguments?: any[];
        canSelectItem?: (row) => boolean;
        defaultSelectedValues?: () => { [key: number]: true };
        getValue?: () => any;
        setValue?: (value) => void;
        dataLookup?: any;
        filterMode?: 'quick' | 'advanced' | 'none';
        noTitle?: boolean;
        dataLookupProps?: DataLookupProps;
    }
    export interface ISingleViewParams {
        id;
        onNavigate?: (id) => Promise<any>;
        noTitle?: boolean;
    }
    export type StatelessListView = React.SFC<IListViewParams>;
    export type StatelessSingleView = React.SFC<ISingleViewParams>;
    export interface IModuleManager {
        baseUrl: string;
        _loadingModules: ({ moduleId, resolve })[];
        load(moduleId: string, src?: string): Promise<IModule>;
        register(moduleId: string, mod: IModule);
    }
    export const moduleManager: IModuleManager;
    export interface IModule {
        setup(opts);
    }
    type TreeNodeType = number | string;
    export interface ITreeListNode {
        text: React.ReactNode;
        key: TreeNodeType;
        parentKey: TreeNodeType;
        isLeaf?: boolean;
        checkBoxStatus?, extraValue?;
    }
    export interface ITreeListProps {
        value?: ITreeListNode[];
        onChange?: (nodes) => any;
        height?: number;
        nodes: ITreeListNode[];
        showCheckBoxes?: boolean;
        getNodeClass?: (item: ITreeListNode) => string;
        onNodeClick?: (e: React.MouseEvent<HTMLElement>) => void;
        mapping?: { key: string, parentKey: string, text: string };
        onGetCheckBoxStatus?: (node) => any;
        onChangeCheckBoxStatus?: (node, newState) => void;
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
    export function openRegistry<T>(): IRegistry<T>;

    export type CustomTesterForRegistry = (key: string) => boolean | string | RegExp;
    export interface IDeveloperFeatures {
        devElement: any;
        devPortId: any;
        forceUpdate(): void;
        getDevButton(): JSX.Element;
    }
    export type DevFriendlyCommand = (target: IDeveloperFeatures & BaseComponent<any, any>) => void;

    export const devTools: IRegistry<DevFriendlyCommand>;
    export const JsonInspector: React.SFC<any>;
    export const DeveloperBar: React.SFC<any> & { topElement, isDevelopmentEnv: boolean, developerFriendlyEnabled };

    export function isProdMode(): boolean;

    export type ErrorCodeForFieldValidation = string;
    export type onErrorCodeResult = (data: any) => OrganicUi.IDataFormAccessorMsg[];
    export class ArrayDataView<T> extends BaseComponent<IArrayDataViewProps<T>, never>{
        getValue(): T[];
        fireAppend();
        fireRemove(idx, length?);
    }
    export interface IDataFormProps<T=any> {
        validate?: boolean;
        onErrorCode?: onErrorCodeResult;
        data?: T;
        onChange?: (data: T) => void;
        bindingSource?: any;
        className?: string;
        style?: React.CSSProperties;
        children?: any;
        onCustomRenderWithCaptureValues?: Function;
        onFieldValidate?: (p: OrganicUi.IFieldProps) => string;
    }
    export interface ISubmitProps {
        className?: string;
        buttonComponent: React.ComponentType<any>;
        bindingSource: Reinvent.BindingHub;
        onExecute: (body) => Promise<any>;
    }
    interface IFilterPanelProps {
        dataForm?: any;
        operators?: any[];
        onApplyClick?: () => any;
        liveMode?: boolean;
    }
    export type TMethods = Function[] | { [key: string]: Function }
    export interface IMenu {
        id: number;
        title: string;
        routerLink: string;
        selectionLink: string;
        href: string;
        icon: string;
        target: string;
        hasSubMenu: boolean;
        parentId: number;
    }
    export interface IAdvancedQueryFilters {
        fromRowIndex: number;
        toRowIndex: number;
        filterModel: FilterItem[];
        sortModel: ({ colId: string, sort: string })[];
    }
    export type OptionsForRESTClient = (() => any) | any;
    function restClient<T=any>(method: 'GET' | 'POST' | 'PUT' | 'HEAD' | 'PATCH' | 'DELETE', url: string, data?): Promise<T>;

    export interface IAppModel {
        getMenuItems(): { menu: IMenu, permission?}[];
        defaultMasterPage: () => any;
        checkPermission(permissionKey): boolean;
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
    export interface IDataListProps<T=any> {
        itemHeight?: number;
        onLoadRequestParams?: Function;
        multiple?: boolean;
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
        flexMode?: boolean;
        startWithEmptyList?: boolean;
        className?: string;
        customDataRenderer?: (items: any[], dataList?: BaseComponent<OrganicUi.IDataListProps<any>>) => JSX.Element;
        detailsListProps?: T;
        selection?: any;
        accquireSelection?: (selection: any) => void;
        itemIsDisabled?: (row: T) => boolean;
        customActions?: TMethods;
        noBestFit?: boolean;
        customActionRenderer?: (funcName: string, func: Function) => JSX.Element;
        onPageChanged?: Function;
    }
    export interface IGroupBoxProps {
        accessor: Reinvent.BindingHub | Reinvent.BindingHub[];
        mode: 'single' | 'list';
        readonly: boolean;
    }
    interface DataListPanelProps extends Partial<IDataPanelProps> {
        contentClassName?:string;
        formMode?: 'modal' | 'callout' | 'panel' | 'section';
        dataListHeight?: number;
        avoidAdd?, avoidDelete?, avoidEdit?: boolean;
        customBar?: TMethods;
        customActions?: TMethods;
        customActionRenderer?: (funcName: string, func: Function) => JSX.Element;
        accessor?: Reinvent.BindingHub | Reinvent.BindingHub[];
        onErrorCode?: onErrorCodeResult;
        singularName?, pluralName?: string;
        style?: React.CSSProperties;
    }
    export interface ModalProps {
        title?: React.ReactNode;
        noClose?: boolean;
        type?: 'error' | 'warning';
        buttons?: { [buttonName: string]: Function }
        buttonHeaders?: { [buttonName: string]: (() => Function) }
        children?: React.ReactNode;
    }
    export interface ImageUploaderProps {
        value?: string;
        onChange?: (base64: string) => void;
        height?: number;
        browseButtonText?: string;
    }
    export const DataListPanel: React.SFC<DataListPanelProps>;
    export const FilterPanel: React.SFC<IFilterPanelProps>;
    interface DataLookupProps {
        source: React.ComponentType<IListViewParams>;
        className?: string;
        onChange?: (value) => void;
        onFocus?: () => void;
        onBlur?: Function;
        textField?: React.ReactNode;
        onDisplayText?: (value) => React.ReactNode;
        canSelectItem?: (row) => boolean;
        multiple?: boolean;
        value?: any;
        iconCode?: string;
        minHeightForPopup?: string;
        popupMode?: DataLookupPopupMode;
        bellowList?: boolean;
        appendMode?: boolean;
        popOverReversed?: boolean;
        style?: React.CSSProperties;
        customReadList?: Function;
        customReadListArguments?: any[];
        filterModelAppend?: any[];
        disableAdjustEditorPadding?: boolean;
    }
    export interface IDataLookupPopupModeProps {
        isOpen: boolean;
        target: HTMLElement;
        reversed: boolean;
        onClose: Function;
        onApply: Function;
        onAppend: Function;
        dataLookup: any;
        dataLookupProps: DataLookupProps;
    }
    export interface IDataLookupActionProps {
        label: any;
        onExecute: () => Promise<any>;
    }
    export type DataLookupPopupMode = React.ComponentClass<IDataLookupPopupModeProps> & { inlineMode: boolean, renderButtons: (p, onClick) => JSX.Element };
    export class DataLookup extends BaseComponent<DataLookupProps, never>{
        static PopOver: DataLookupPopupMode;
        static Modal: DataLookupPopupMode;
        static Action: React.SFC<IDataLookupActionProps>;

    }
    export class TreeList extends BaseComponent<ITreeListProps, any>{ }

    interface IAdvButtonProps {
        children?: any;
        isLoading?: boolean;
        callout?: any;
        primary?: boolean;
        style?: React.CSSProperties;
        onClick?: () => any;
        fixedWidth?: boolean;
        className?: string;
        outterClassName?: string;
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
        disabled?: boolean;
    }
    export const AdvButton: React.SFC<IAdvButtonProps>;
    // Custom Components for  SepidSystem Company 
    export const TimeSlot: React.SFC<ITimeSlotProps>;
    interface IDialogProps {
        title?, content?: any;
        actions?: { [key: string]: Function }
        defaultValues?: any;
        noClose?: boolean;
        width?: number;
    }
    interface AppUtilsIntf {
        (p: any): JSX.Element;
        showDialog(content, opts?: IDialogProps): void;
        closeDialog();
        confrim(content, opts?: IDialogProps): Promise<any>;
        confrimActionByUser(p: { actionName: string, actionData }): Promise<never>;
        showDataDialog<T>(content: React.ReactElement<Partial<IDataFormProps<T>>>, opts?: IDialogProps): Promise<T>;
        afterREST({ method, url, data, result });

    }
    export interface IMessageBarProps {
        className?: string;
        onClose?: Function;
        variant: 'success' | 'warning' | 'error' | 'info';
        children?: any;
        style?: React.CSSProperties;
    }
    export interface ITimeEditProps {
        value?: string;
        keepSeconds?: boolean;
        onChange?: React.ChangeEventHandler<HTMLInputElement>;
    }
    export const AppUtils: AppUtilsIntf;
    export const Headline: React.SFC<React.HTMLAttributes<any>>;
    export namespace Icons {
        export const AddIcon: React.SFC<any>;
        export const DeleteIcon: React.SFC<any>;
        export const EditIcon: React.SFC<any>;
    }
}

declare module '@organic-ui' {

    export const reinvent: Reinvent.reinvent;
    export type TMethods = OrganicUi.TMethods;

    export const Utils: typeof OrganicUi.Utils;
    export const AppUtils: typeof OrganicUi.AppUtils;
    export const DataLookup: typeof OrganicUi.DataLookup;
    export const TreeList: typeof OrganicUi.TreeList;
    export const ImageUploader: React.SFC<OrganicUi.ImageUploaderProps>;
    export const Modal: React.SFC<OrganicUi.ModalProps>;
    export const i18n: typeof OrganicUi.i18n;
    export const routeTable: typeof OrganicUi.routeTable;
    export type IFieldProps = OrganicUi.IFieldProps<IColumn>;
    export class Field extends OrganicUi.Field<IColumn>{

    }
    export type IAppModel = OrganicUi.IAppModel;
    export const startApp: typeof OrganicUi.startApp;
    export type Menu = OrganicUi.Menu;
    export const Menu: typeof OrganicUi.Menu;
    export type IActionsForCRUD<TDto> = OrganicUi.IActionsForCRUD<TDto>;
    export type IOptionsForCRUD = OrganicUi.IOptionsForCRUD;
    export { AxiosRequestConfig as RequestConfig } from 'axios';
    import { AxiosRequestConfig } from 'axios';
    import { IColumn, IDetailsListProps } from 'office-ui-fabric-react';
    import { AnchorHTMLAttributes, CSSProperties, HTMLAttributes, ComponentType } from 'react';
    export const JssProvider: any;
    export function scanAllPermission(table: { data }): Promise<ITreeListNode[]>;
    export type StatelessSingleView = OrganicUi.StatelessSingleView;
    export type StatelessListView = OrganicUi.StatelessListView;
    export type IAdvancedQueryFilters = OrganicUi.IAdvancedQueryFilters;
    export interface OptForRESTClient extends Partial<AxiosRequestConfig> {
        title: string;
        setBaseURL?: (baseUrl: string) => void;
        rejectHandler?: Function;
    }
    export const appData: {
        appModel?: IAppModel

    }
    export type OptionsForRESTClient = (() => Partial<OptForRESTClient>) | OptForRESTClient;
    export const createClientForREST: (options?: OptionsForRESTClient) => typeof restClient;
    function restClient<T=any>(method: 'GET' | 'POST' | 'PUT' | 'HEAD' | 'PATCH' | 'DELETE', url: string, data?): Promise<T>;
    export type ResultSet<T> = OrganicUi.ResultSet<T>;
    export type ErrorCodeForFieldValidation = OrganicUi.ErrorCodeForFieldValidation;
    export type IDataFormAccessorMsg = OrganicUi.IDataFormAccessorMsg;
    export type PromisedResultSet<T> = OrganicUi.PromisedResultSet<T>;
    export type ReportReadMethod = OrganicUi.ReportReadMethod;
    export type ActionResult = Promise<any>;
    export type IListData<TRow=any> = OrganicUi.IListData;
    interface IBindableElement {
        tryToBinding();
    }


    export const Version: string;
    export type IComponentRefer<T=any> = OrganicUi.IComponentRefer;
    export class BaseComponent<P=any, S=any> extends OrganicUi.BaseComponent<P, S>{ }
    export const moduleManager: typeof OrganicUi.moduleManager;
    export type IModule = OrganicUi.IModule;
    export const UiKit: typeof OrganicUi.UiKit;
    export const ViewBox: React.SFC<OrganicUi.OrganicBoxProps<any, any, any>>;
    export const DashboardBox: React.SFC<OrganicUi.OrganicBoxProps<any, any, any>>;
    export type ISingleViewBox<T=any> = OrganicUi.ISingleViewBox<T> & React.ReactInstance;
    export type IListViewParams = OrganicUi.IListViewParams;
    export type ISingleViewParams = OrganicUi.ISingleViewParams;
    export const ListViewBox: typeof OrganicUi.ListViewBox;
    export const Anchor: React.SFC<AnchorHTMLAttributes<any>>;
    export const DatePicker: React.SFC<OrganicUi.DatePickerProps>;
    export const ComboBox: typeof OrganicUi.ComboBox;
    export const TimeEdit: typeof OrganicUi.TimeEdit;
    export const AdvButton: typeof OrganicUi.AdvButton;
    export const Panel: typeof OrganicUi.Panel;
    export class DataForm extends BaseComponent<Partial<OrganicUi.IDataFormProps>, any> {
        revalidateAllFields(): Promise<IDataFormAccessorMsg[]>;
        showInvalidItems(invalidItems?: IDataFormAccessorMsg[]): JSX.Element;
        getFieldErrorsAsElement(): Promise<JSX.Element>
    }
    export const MinimalMasterPage: any;
    export class ArrayDataView<T> extends OrganicUi.ArrayDataView<T>{ }
    export const DataList: React.SFC<OrganicUi.IDataListProps<IDetailsListProps>>;
    export const DataTreeList: typeof OrganicUi.DataTreeList;
    export const DataTable: React.SFC<OrganicUi.DataTableProps>;
    export const DataPanel: typeof OrganicUi.DataPanel;
    export const DataListPanel: typeof OrganicUi.DataListPanel;
    export const FilterPanel: typeof OrganicUi.FilterPanel;
    export const i18nAttr: typeof OrganicUi.i18nAttr;
    export const icon: typeof OrganicUi.icon;
    export const editorByAccessor: typeof OrganicUi.editorByAccessor;
    export const menuBar: typeof OrganicUi.menuBar;
    export type ITreeListNode = OrganicUi.ITreeListNode;
    export type ITreeListProps = OrganicUi.ITreeListProps;
    export type CustomTesterForRegistry = OrganicUi.CustomTesterForRegistry;
    export type IDeveloperFeatures = OrganicUi.IDeveloperFeatures;
    export type IAdvSectionProps = OrganicUi.IAdvSectionProps;
    export type ITimeEditProps = OrganicUi.ITimeEditProps;
    export type IMessageBarProps = OrganicUi.IMessageBarProps;
    export function createGenerateClassName(p: any);
    export function Collapsible(p: any);
    export type IRegistry<T> = OrganicUi.IRegistry;

    export const isProdMode: typeof OrganicUi.isProdMode;
    export const devTools: typeof OrganicUi.devTools;
    export const JsonInspector: typeof OrganicUi.JsonInspector;
    export const DeveloperBar: typeof OrganicUi.DeveloperBar;

    export const Headline: typeof OrganicUi.Headline;
    // SepidSystem
    export type ITimeSlotRange = OrganicUi.ITimeSlotRange;
    export const TimeSlot: typeof OrganicUi.TimeSlot;

    //--- for businness application & admin panels

    export const tags: typeof OrganicUi.tags;
    export const reports: typeof OrganicUi.reports;
    export const dashboardBlocks: typeof OrganicUi.dashboardBlocks;
    export const acl: typeof OrganicUi.acl;
    // decorators
    function decoSubRender(target: any, propertyName: string, descriptor: TypedPropertyDescriptor<Function>)
    export function SubRender(): typeof decoSubRender;
    function decoHelper(target: typeof BaseComponent)
    export function Helper(helperId): typeof decoHelper;
    export function SelfBind(): MethodDecorator;
    export const Icons: typeof OrganicUi.Icons;
    //   Inspired Components;
    export { TextField, Switch, Checkbox, Select, Button, RadioGroup, FormControlLabel, Icon, IconButton, SnackbarContent, Tab, Tabs, Paper, Radio } from '@material-ui/core';
    export { GridList, GridListTile } from '@material-ui/core'
    export { Callout } from 'office-ui-fabric-react';
    export { Fabric } from 'office-ui-fabric-react/lib/Fabric';
    import { ChartConfiguration } from 'c3'
    export const C3Chart: React.SFC<ChartConfiguration>;
    import SweetAlert2 from 'sweetalert2';
    export function Alert(options: ReactSweetAlertOptions): typeof SweetAlert2 & ReactSweetAlert;
    import { SweetAlertOptions, SweetAlertResult, SweetAlertType } from 'sweetalert2';
    type ReactElementOr<K extends keyof SweetAlertOptions> = SweetAlertOptions[K] | React.ReactElement<any>;
    type ReactSweetAlertOptions = Overwrite<SweetAlertOptions, ReactOptions>;
    type Overwrite<T, U> = Pick<T, Exclude<keyof T, keyof U>> & U;

    interface ReactOptions {
        title?: ReactElementOr<'title'>;
        html?: ReactElementOr<'html'>;
        confirmButtonText?: ReactElementOr<'confirmButtonText'>;
        cancelButtonText?: ReactElementOr<'cancelButtonText'>;
        footer?: ReactElementOr<'footer'>;
    }
    interface ReactSweetAlert {
        (title?: ReactElementOr<'title'>, message?: ReactElementOr<'html'>, type?: SweetAlertType): Promise<SweetAlertResult>;
        (options: ReactSweetAlertOptions & { useRejections?: false }): Promise<SweetAlertResult>;
        (options: ReactSweetAlertOptions & { useRejections: true }): Promise<any>;
    }

}

declare module '*.jpg';
declare module '*.png';
declare module '*.jpeg';
declare module '*.svg';

