
declare namespace Reinvent {
    export interface IRendererArg<S> {
        props;
        state: S;
        repatch(delta: Partial<S>): void;
        subrender(rendererId: string, params);
        callAction(actionName: string, actionParams): Promise<any>;
        root: HTMLElement;
    }
    type TRenderFunc<S, THelpers={}> = (args: S extends never ? never : IRendererArg<S> & THelpers) => JSX.Element;

    interface IBaseFrontEndReinvent<S, THookFuncParam=OrganicUi.BaseComponent<any, S>> extends React.ComponentClass {
        assignRoute(pattern: string): IBaseFrontEndReinvent<S>;
        hook(type: 'action', hookName: string, renderFunc: (p: THookFuncParam) => Promise<any>): IBaseFrontEndReinvent<S>;
        hook(type: 'block', hookName: string, renderFunc: (p: THookFuncParam) => JSX.Element): IBaseFrontEndReinvent<S>;
        hook(type: 'dialog', hookName: string, renderFunc: (p: THookFuncParam) => JSX.Element): IBaseFrontEndReinvent<S>;
        hook(type: 'validate', hookName: string, renderFunc: (p: THookFuncParam) => boolean): IBaseFrontEndReinvent<S>;
        hook(type: 'watcher', hookName: string, renderFunc: (p: THookFuncParam) => any): IBaseFrontEndReinvent<S>;
        renderer(renderFunc: TRenderFunc<S>): IBaseFrontEndReinvent<S>;
        done({ moduleId: string }): IBaseFrontEndReinvent<S, THookFuncParam>;
    }
    interface IGetDataParams {
        defaultData?:any;
    }

    interface IRenderFuncExtForSingleView<T, TLoadParam> {
        data: T;
        getData(params?: IGetDataParams): T;
        getSubData<KV extends keyof T>(key: keyof T, params?: IGetDataParams): T[KV];
        binding: BindingHub<T>;
        param: TLoadParam;

        reload: (param: TLoadParam) => Promise<any>;
    }
    interface IRenderFuncExtForDashboard<TData, TState, TLoadParam> {
        data: TData;
        binding: BindingHub<TData>;
        param: TLoadParam;
        reload: (delta?: Partial<TState>) => Promise<any>;
    }
    interface IReinventForCRUDParams<TDto, TState> {
        data: TDto;
        getData(params?: IGetDataParams): TDto;
        getSubData<KV extends keyof TDto>(key: keyof TDto, params?: IGetDataParams): TDto[KV];
        binding: BindingHub<TDto>;
        props;
        params: any;
        state: TState;
        repatch(delta: Partial<TState>): void;
        selectedItems(): TDto[],
        subrender(rendererId: string, params);
        callAction(actionName: string, actionParams): Promise<any>;
        root: HTMLElement;
        reload: Function;
    }
    interface IReinventForCRUD<TDto> extends IBaseFrontEndReinvent<never> {
        singleView<TState=never>(renderFunc: (p: IReinventForCRUDParams<TDto, TState>) => JSX.Element): IReinventForCRUD<TDto>;
        beforeSave(callback: (dto: TDto) => (TDto | Promise<TDto>)): IReinventForCRUD<TDto>;
        afterMapResponse(callback: (dto: TDto) => TDto): IReinventForCRUD<TDto>;
        afterSave(callback: (dto: TDto) => any): IReinventForCRUD<TDto>;
        afterSingleRead(pattern: string): IReinventForCRUD<TDto>;
        listView<TState=never>(renderFunc: (p: IReinventForCRUDParams<TDto, TState>) => JSX.Element): IReinventForCRUD<TDto>;
        beforeReadList(pattern: string): IReinventForCRUD<TDto>;
        afterReadList(pattern: string): IReinventForCRUD<TDto>;
        configureFields(renderFunc: ({ binding: TDto }) => (any[] | { [key: string]: (any[]) })): IReinventForCRUD<TDto>;

    }

    export interface IDashboardWidgetReinvent<TLoadParam, TData> extends IBaseFrontEndReinvent<never> {
        defaultState(state: Partial<TData>): IDashboardWidgetReinvent<TLoadParam, TData>;
        paramInitializer(loaderFunc: () => TLoadParam): IDashboardWidgetReinvent<TLoadParam, TData>;
        dataLoader(callback: (param: TLoadParam, state: TData) => (TData | Promise<TData>)): IDashboardWidgetReinvent<TLoadParam, TData>;
        dataRenderer(renderFunc: TRenderFunc<TData, IRenderFuncExtForDashboard<TData, TData, TLoadParam>>): IDashboardWidgetReinvent<TLoadParam, TData>;
    }

    interface IDashboardWidgetOptions {
        cols?: number;
        fragment?: boolean;
        interval?: number;
    }
    interface IEditorReinvent {
        editor(fieldName: string, element: React.ReactElement<any>): IEditorReinvent;
        editor(tester: (fieldName: string) => boolean, element: React.ReactElement<any>): IEditorReinvent;
        fragment(element: React.ReactElement<React.ReactFragment>): IEditorReinvent;
    }
    export interface reinvent {

        <TLoadParam, TData>(type: 'frontend:dashboard:widget', options: IDashboardWidgetOptions): IDashboardWidgetReinvent<TLoadParam, TData>;
        <TDto>(type: 'frontend:crud', opts: { actions: OrganicUi.IActionsForCRUD<TDto>, options: OrganicUi.IOptionsForCRUD }): IReinventForCRUD<TDto>;
        <TDto>(type: 'frontend:report', opts: { actions: OrganicUi.IActionsForCRUD<TDto>, options: OrganicUi.IOptionsForCRUD }): IReinventForCRUD<TDto>;
        <TState>(type: 'frontend'): IBaseFrontEndReinvent<TState>;
        <TState>(type: 'frontend:monitoring', { interval }): IBaseFrontEndReinvent<TState>;
        (type: 'frontend:editor'): IEditorReinvent;
  
        query(selector): any[];
        utils: {
            listViewFromArray<T>(items: T[], options?: { keyField?: string, fields?: string[], title?, iconCode?}): OrganicUi.StatelessListView;
            showDialogForAddNew(componentType): (() => Promise<any>);
            listViewFromEnum<TEnum>(enumType, options?: { keyField?: string, title?, iconCodes: { [key in keyof TEnum]: string } }): OrganicUi.StatelessListView;

        }
        predefinesForApi: any;
    }
    export interface IBindingPoint {
        __name: string;
        __path: string[];
        __isArray: boolean;
    }

    export type BindingHub<T=any> = {
        [P in keyof T]?: T[P] extends (number | string | Date| boolean | number[] | string[]) ? IBindingPoint : BindingHub<T[P]>;

    };
    type TemplateName = 'report-view' | 'dashboard' | 'login' | 'blank';
    export function templatedView<T>(templName: 'singleView' | 'listView', opts: {
        actions?: OrganicUi.IActionsForCRUD<T>,
        options?: OrganicUi.IOptionsForCRUD, ref?: string,
        predefinedActions?: string,
        customActions?: Partial<OrganicUi.IActionsForCRUD<T>>
    }): MethodDecorator;
    export function templatedView<T>(templName: TemplateName, opts?): MethodDecorator;
    export function templatedView<TProps>(method: React.SFC<TProps>): (templName: TemplateName, props) => React.SFC<TProps>;

    export class BindingSource<T> implements IBindingPoint {
        __name: string;
        __path: string[];
        __isArray: boolean;
        __bindingSource: BindingSource<T>;
        getFieldValue(bindingPoint: IBindingPoint);
        setFieldValue(bindingPoint: IBindingPoint, value, indexes?: { [key: string]: number })
        constructor(data: any);
    }
    export function openBindingSource<T>(): BindingHub<T>;
    export function    fork<T>(sourceClass:T,options):T;
}


declare module '@reinvent' {
    export =Reinvent;
}