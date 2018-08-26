
declare namespace OrganicUi {
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

    interface IRenderFuncExtForSingleView<T, TLoadParam> {
        data: T;
        binding: BindingHub<T>;
        param: TLoadParam;
        reload: (param: TLoadParam) => Promise<any>;
    }
    interface IReinventForCRUDParams<TDto, TState> {
        data: TDto;
        binding: BindingHub<TDto>;
        props;
        state: TState;
        repatch(delta: Partial<TState>): void;
        subrender(rendererId: string, params);
        callAction(actionName: string, actionParams): Promise<any>;
        root: HTMLElement;
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
        paramInitializer(loaderFunc: () => TLoadParam): IDashboardWidgetReinvent<TLoadParam, TData>;
        dataLoader(callback: (param: TLoadParam) => (TData | Promise<TData>)): IDashboardWidgetReinvent<TLoadParam, TData>;
        dataRenderer(renderFunc: TRenderFunc<TData, IRenderFuncExtForSingleView<TData, TLoadParam>>): IDashboardWidgetReinvent<TLoadParam, TData>;
    }

    interface IDashboardWidgetOptions {
        cols?: number;
        fragment?:boolean;
        interval?:number;
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
        (type: 'frontend:editor'): IEditorReinvent;
        query(selector): any[];
        utils: {
            listViewFromArray<T>(items: T[], options?: { keyField?: string, fields?: string[], title?, iconCode?}): OrganicUi.StatelessListView;
            showDialogForAddNew(componentType: React.ComponentType<ISingleViewParams>): Promise<any>
        }
        templatedView<T>(templName: 'singleView' | 'listView', opts: { actions: OrganicUi.IActionsForCRUD<T>, options: OrganicUi.IOptionsForCRUD, ref?: string, customActions?: Partial<OrganicUi.IActionsForCRUD<T>> }): MethodDecorator;
        openBindingHub<T>(): BindingHub<T>;
    }
    export interface BindingPoint {
        __name: string;
    }

    export type BindingHub<T=any> = {
        [P in keyof T]?: T[P] extends (object | object[]) ? BindingHub<T[P]> :
        BindingPoint;
    };
}


