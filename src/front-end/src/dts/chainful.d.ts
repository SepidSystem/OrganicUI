
declare namespace OrganicUi {
    export interface IRendererArg<S> {
        props;
        state: S;
        repatch(delta: Partial<S>): void;
        subrender(rendererId: string, params);

        exec(actionName, actionParams): Promise<any>
    }
    type TRenderFunc<S, THelpers={}> = (args: S extends never ? never : IRendererArg<S> & THelpers) => JSX.Element;

    interface IBaseFrontEndChain<S> {
        defineWatcher(stateId, callback: (view: OrganicUi.BaseComponent<any, S>) => any): IBaseFrontEndChain<S>;
        defineAction(actionId, callback): IBaseFrontEndChain<S>;
        defineSubRenderer(actionId, callback): IBaseFrontEndChain<S>;
        assignToRouteTable(pattern: string): IBaseFrontEndChain<S>;
        renderer(renderFunc: TRenderFunc<S>);
        done(): void;
    }
    export function open<TState>(type: 'frontend:page'): IBaseFrontEndChain<TState>;
    interface IRenderFuncExtForSingleView<T> {
        data: T;
        autoBind: T;
    }
    interface ICRUDChain<TDto> extends IBaseFrontEndChain<never> {
        singleView(renderFunc: TRenderFunc<never, IRenderFuncExtForSingleView<TDto>>): ICRUDChain<TDto>;
        beforeSave(callback: (dto: TDto) => (TDto | Promise<TDto>)): ICRUDChain<TDto>;
        afterMapResponse(callback: (dto: TDto) => TDto): ICRUDChain<TDto>;
        afterSave(callback: (dto: TDto) => any): ICRUDChain<TDto>;
        afterSingleRead(pattern: string): ICRUDChain<TDto>;
        listView(renderFunc: TRenderFunc<never>): ICRUDChain<TDto>;
        beforeReadList(pattern: string): ICRUDChain<TDto>;
        afterReadList(pattern: string): ICRUDChain<TDto>;
        frameView(renderFunc: TRenderFunc<never, IRenderFuncExtForSingleView<TDto>>): ICRUDChain<TDto>;

    }
    export function open<TDto>(type: 'frontend:crud', actions: OrganicUi.IActionsForCRUD<TDto>, options: IOptionsForCRUD): ICRUDChain<TDto>;
    export function open<TDto>(type: 'frontend:report', actions: OrganicUi.IActionsForCRUD<TDto>, options: IOptionsForCRUD): ICRUDChain<TDto>;

    interface IDashboardBlockChain<TData, TState=any> {
        paramInitializer: () => TState
        loader(renderer: (state: TState) => (TData | Promise<TData>));
        renderer(renderFunc: TRenderFunc<TState,IRenderFuncExtForSingleView<TData>>);

    }
    export function open<TData>(type: 'frontend:dashboard:block'): IDashboardBlockChain<TData>;

}

