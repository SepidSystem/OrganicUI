declare namespace OrganicUi {
    interface IStatefulComponentChainful<S> {
        defineWatcher(stateId, callback: (view: BaseComponent<any, S>) => any): IStatefulComponentChainful<S>;
        defineAction(actionId, callback): IStatefulComponentChainful<S>;
        defineSubRenderer(actionId, callback): IStatefulComponentChainful<S>;
        assignToRouteTable(pattern: string): IStatefulComponentChainful<S>;
        renderer(renderFunc: (args: S extends never ? never : IStatefulRenderer<S>) => JSX.Element)
    }
    export function open<TState>(type: 'base'): IStatefulComponentChainful<TState>;
    /*
        interface ICRUDChainful<TDto> extends StatefulComponentChainful<never> {
            listView(stateId, callback: (view: BaseComponent<any, S>) => any): IStatefulComponentChainful<S>;
            singleView(actionId, callback): IStatefulComponentChainful<S>;
            beforeSave(actionId, callback): IStatefulComponentChainful<S>;
            beforeSingleRead(pattern: string): IStatefulComponentChainful<S>;
            afterSave(actionId, callback): IStatefulComponentChainful<S>;
            afterSingleRead(pattern: string): IStatefulComponentChainful<S>;
             
            beforeListRead(pattern: string): IStatefulComponentChainful<S>;
    
        }
        export function open<TState>(type: 'crud'): IStatefulComponentChainful<TState>;
    */
}
