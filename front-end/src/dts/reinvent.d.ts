
declare namespace OrganicUi {
    export interface IRendererArg<S> {
        props;
        state: S;
        repatch(delta: Partial<S>): void;
        subrender(rendererId: string, params);
        callAction(actionName: string, actionParams): Promise<any>
    }
    type TRenderFunc<S, THelpers={}> = (args: S extends never ? never : IRendererArg<S> & THelpers) => JSX.Element;

    interface IBaseFrontEndReinvent<S, THookFuncParam=OrganicUi.BaseComponent<any, S>> {
        assignRoute(pattern: string): IBaseFrontEndReinvent<S>;
        hook(type: 'action', hookName: string, renderFunc: (p: THookFuncParam) => Promise<any>): IBaseFrontEndReinvent<S>;
        hook(type: 'block', hookName: string, renderFunc: (p: THookFuncParam) => JSX.Element): IBaseFrontEndReinvent<S>;
        hook(type: 'dialog', hookName: string, renderFunc: (p: THookFuncParam) => JSX.Element): IBaseFrontEndReinvent<S>;
        hook(type: 'validate', hookName: string, renderFunc: (p: THookFuncParam) => boolean): IBaseFrontEndReinvent<S>;
        hook(type: 'watcher', hookName: string, renderFunc: (p: THookFuncParam) => any): IBaseFrontEndReinvent<S>;
        renderer(renderFunc: TRenderFunc<S>): IBaseFrontEndReinvent<S>;

        done(): void;
    }

    interface IRenderFuncExtForSingleView<T, TLoadParam> {
        data: T;
        binding: T;
        param: TLoadParam;
        reload: (param: TLoadParam) => Promise<any>;
    }
    interface IReinventForCRUD<TDto> extends IBaseFrontEndReinvent<never> {
        singleView(renderFunc: TRenderFunc<never, IRenderFuncExtForSingleView<TDto, { id }>>): IReinventForCRUD<TDto>;
        beforeSave(callback: (dto: TDto) => (TDto | Promise<TDto>)): IReinventForCRUD<TDto>;
        afterMapResponse(callback: (dto: TDto) => TDto): IReinventForCRUD<TDto>;
        afterSave(callback: (dto: TDto) => any): IReinventForCRUD<TDto>;
        afterSingleRead(pattern: string): IReinventForCRUD<TDto>;
        listView(renderFunc: TRenderFunc<never>): IReinventForCRUD<TDto>;
        beforeReadList(pattern: string): IReinventForCRUD<TDto>;
        afterReadList(pattern: string): IReinventForCRUD<TDto>;
        configureFields(renderFunc: ({ binding: TDto }) => (any[] | { [key: string]: (any[]) })): IReinventForCRUD<TDto>;

    }

    interface IDashboardWidgetReinvent<TLoadParam, TData> {
        paramInitializer(loaderFunc: () => TLoadParam): IDashboardWidgetReinvent<TLoadParam, TData>;
        dataLoader(callback: (param: TLoadParam) => (TData | Promise<TData>)): IDashboardWidgetReinvent<TLoadParam, TData>;
        dataRenderer(renderFunc: TRenderFunc<TData, IRenderFuncExtForSingleView<TData, TLoadParam>>);

    }
    interface IDashboardWidgetOptions {

    }
    export interface reinvent {
        <TLoadParam, TData>(type: 'frontend:dashboard:widget', options: IDashboardWidgetOptions): IDashboardWidgetReinvent<TLoadParam, TData>;
        <TDto>(type: 'frontend:crud', actions: OrganicUi.IActionsForCRUD<TDto>, options: IOptionsForCRUD): IReinventForCRUD<TDto>;
        <TDto>(type: 'frontend:report', actions: OrganicUi.IActionsForCRUD<TDto>, options: IOptionsForCRUD): IReinventForCRUD<TDto>;
        <TState>(type: 'frontend'): IBaseFrontEndReinvent<TState>;
        query(selector): any[];

    }
}

