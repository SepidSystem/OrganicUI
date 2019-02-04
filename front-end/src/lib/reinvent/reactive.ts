export function patch() {

}
function invoke(reducer, action, state) {
    if (!reducer) return;
    if (reducer instanceof Function)
        return reducer(action, state);
    if (reducer instanceof Array)
        return reducer.reduce((accum, r) => accum || dispatch(r, action, state), null);
    return dispatch(reducer && reducer[action.type], action, state);

}
export function dispatch(reducer, action, state) {

    const stub = invoke(reducer, action, state);

}
export function useHook<TState, TReducers>(reducer, initialState?: TState): [TState, TReducers] {

    return null;
}

