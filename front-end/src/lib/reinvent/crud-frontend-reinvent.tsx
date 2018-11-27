/// <reference path="../../dts/organic-ui.d.ts" />
import { reinvent } from "./reinvent";
import { Utils } from "../core/utils";
import { Spinner } from '../core/spinner';
import { routeTable } from "../core/router";
import { BindingSource } from "./binding-source";
interface IParams<TDto> { actions: OrganicUi.IActionsForCRUD<TDto>, customActions, options: OrganicUi.IOptionsForCRUD };
function classFactory<TDto>(p: IParams<TDto>):
    Reinvent.IReinventForCRUD<TDto> {
    const chainMethods = ['configureFields', 'singleView', 'listView', 'size'];
    let { actions, options, customActions } = p;
    customActions = customActions || {};
    const AClass = reinvent.baseClassFactory({ chainMethods, className: 'crud' });
    function doneFunc() {

        routeTable.set(p.options.routeForSingleView, AClass, { mode: 'single-view' });
        routeTable.set(p.options.routeForListView, AClass, { mode: 'list-view' });
    }
    function beforeSave(callback) {
        Object.assign(customActions, { beforeSave: callback });
        return AClass;
    }
    function getRenderParams(target) {
        const { state } = target;
        const { data } = target.state;
        const bindingSource = target.bindingSource = target.bindingSource || new BindingSource();
        const result = {
            state: target.target || {}, props: target.props,
            data, bindingSource,
            binding: bindingSource,
            repatch: target.repatch.bind(target),
            runAction: target.runAction.bind(this),
            root: target.refs.root,
            subrender: target.subrender.bind(target),
            showModal: target.showModal.bind(target),
            reload: () => target && target.refs && target.refs.main&& target.refs.main.reload && target.refs.main.reload()
        };
        return result;
    }
    AClass.renderer(p => {
        const { id } = p.props, { data } = p.state;
        if (data instanceof Promise) return <div ref="root" className="flex-center flex-full-center">
            <Spinner />
        </div>;
        const targetKey = id ? 'singleView' : 'listView';
        const componentClass = reinvent.templates[targetKey] as React.ComponentClass<any>;
        const result = AClass.applyChain(targetKey, p) as React.ReactElement<any>;
        const children = React.Children.toArray(result.props.children);
        return React.createElement(componentClass, { ref: "main", actions, params: p.props, options, customActions }, ...children);
    });
    return Object.assign(AClass, { options, getRenderParams, beforeSave, doneFunc, actions, dataLookupActions: actions, dataLookupOptions: options }) as any;
}
reinvent.factoryTable['frontend:crud'] = classFactory;