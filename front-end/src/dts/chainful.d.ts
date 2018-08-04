
declare namespace OrganicUi {
    export interface IRendererArg<S> {
        props;
        state: S;
        repatch(delta: Partial<S>): void;
        subrender(rendererId: string, params);
        callAction(actionName: string, actionParams): Promise<any>
    }
    type TRenderFunc<S, THelpers={}> = (args: S extends never ? never : IRendererArg<S> & THelpers) => JSX.Element;

    interface IBaseFrontEndChain<S, THookFuncParam=OrganicUi.BaseComponent<any, S>> {
        assignRoute(pattern: string): IBaseFrontEndChain<S>;
        hook(type: 'action', hookName: string, renderFunc: (p: THookFuncParam) => Promise<any>): IBaseFrontEndChain<S>;
        hook(type: 'block', hookName: string, renderFunc: (p: THookFuncParam) => JSX.Element): IBaseFrontEndChain<S>;
        hook(type: 'dialog', hookName: string, renderFunc: (p: THookFuncParam) => JSX.Element): IBaseFrontEndChain<S>;
        hook(type: 'validate', hookName: string, renderFunc: (p: THookFuncParam) => boolean): IBaseFrontEndChain<S>;
        hook(type: 'watcher', hookName: string, renderFunc: (p: THookFuncParam) => boolean): IBaseFrontEndChain<S>;
        renderer(renderFunc: TRenderFunc<S>): IBaseFrontEndChain<S>;
     
        done(): void;
    }

    interface IRenderFuncExtForSingleView<T, TLoadParam> {
        data: T;
        bindingSource: T;
        param: TLoadParam;
        reload: (param: TLoadParam) => Promise<any>;
    }
    interface ICRUDChain<TDto> extends IBaseFrontEndChain<never> {
        singleView(renderFunc: TRenderFunc<never, IRenderFuncExtForSingleView<TDto, { id }>>): ICRUDChain<TDto>;
        beforeSave(callback: (dto: TDto) => (TDto | Promise<TDto>)): ICRUDChain<TDto>;
        afterMapResponse(callback: (dto: TDto) => TDto): ICRUDChain<TDto>;
        afterSave(callback: (dto: TDto) => any): ICRUDChain<TDto>;
        afterSingleRead(pattern: string): ICRUDChain<TDto>;
        listView(renderFunc: TRenderFunc<never>): ICRUDChain<TDto>;
        beforeReadList(pattern: string): ICRUDChain<TDto>;
        afterReadList(pattern: string): ICRUDChain<TDto>;
        frameView(renderFunc: TRenderFunc<never, IRenderFuncExtForSingleView<TDto, { id }>>): ICRUDChain<TDto>;
    }

    interface IDashboardWidgetChain<TLoadParam, TData> {
        paramInitializer(loaderFunc: () => TLoadParam): IDashboardWidgetChain<TLoadParam, TData>;
        dataLoader(callback: (param: TLoadParam) => (TData | Promise<TData>)): IDashboardWidgetChain<TLoadParam, TData>;
        dataRenderer(renderFunc: TRenderFunc<TData, IRenderFuncExtForSingleView<TData, TLoadParam>>);

    }
    interface IDashboardWidgetOptions {

    }
    export interface open {
        <TLoadParam, TData>(type: 'frontend:dashboard:block', options: IDashboardWidgetOptions): IDashboardWidgetChain<TLoadParam, TData>;
        <TDto>(type: 'frontend:crud', actions: OrganicUi.IActionsForCRUD<TDto>, options: IOptionsForCRUD): ICRUDChain<TDto>;
        <TDto>(type: 'frontend:report', actions: OrganicUi.IActionsForCRUD<TDto>, options: IOptionsForCRUD): ICRUDChain<TDto>;
        <TState>(type: 'frontend'): IBaseFrontEndChain<TState>;
        query(selector): any[];

    }
}

