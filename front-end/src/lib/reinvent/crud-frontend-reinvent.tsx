/// <reference path="../../dts/organic-ui.d.ts" />
import { reinvent } from "./reinvent";
import { Utils } from "../core/utils";
import { Spinner } from '../core/spinner';
import { routeTable } from "../core/router";
import { BindingSource } from "./binding-source";
import { ListViewBox } from "../templated-views/list-view-box";
import { SingleViewBox } from "../templated-views/single-view-box";
import { IBaseFrontEndReinvent } from "@reinvent";
interface IParams<TDto> { actions: OrganicUi.IActionsForCRUD<TDto>, customActions, options: OrganicUi.IOptionsForCRUD };
function classFactory<TDto>(p: IParams<TDto>):
    Reinvent.IReinventForCRUD<TDto> {
    const chainMethods = ['configureFields', 'singleView', 'listView', 'size'];
    let { actions, options, customActions } = p;
    customActions = customActions || {};
    const AClass = reinvent.baseClassFactory({ chainMethods, className: 'crud' });
    function doneFunc() {
        if (p.options) {
            routeTable.set(p.options.routeForSingleView, AClass, { mode: 'single-view' });
            routeTable.set(p.options.routeForListView, AClass, { mode: 'list-view' });
        }
    }
    function beforeSave(callback) {
        Object.assign(customActions, { beforeSave: callback });
        return AClass;
    }
    function getRenderParams(target) {
        const { state } = target;
        const { data } = target.state;
        const bindingSource = target.bindingSource = target.bindingSource || new BindingSource();
        const { props } = target;
        const protoype = Object.getPrototypeOf(target) || {};
        const { constructor } = protoype as any;
       
        const params = {
            ...props,
            ...(protoype && protoype.getForkData instanceof Function ? protoype.getForkData() : {}),
            ...(constructor && constructor.getForkData instanceof Function ? constructor.getForkData() : {})
        };
        const result = {
            state: target.target || {}, props:params,params,
            data, bindingSource,
            getData: ({ defaultData = null } = {}) => {
                const singleView: SingleViewBox<any> = target.refs.main || target.querySelectorAll('.single-view')[0];
                const result = (singleView && singleView.state && singleView.state.formData);
                if (result instanceof Promise || !result) {
                    target.repatch({}, null, 10);

                }
                return result || defaultData;
            },
            getSubData: (key, { defaultData = null }) => {
                let data = result.getData();
                data = data && data[key];
                return data || defaultData;
            },
            binding: bindingSource,
            repatch: target.repatch.bind(target),
            selectedItems() {
                const listView: ListViewBox = target.querySelectorAll('.list-view')[0];
                return listView.selectedItems();
            },
            runAction: target.runAction.bind(this),
            root: target.refs.root,
            subrender: target.subrender.bind(target),
            showModal: target.showModal.bind(target),
            reload: () => target && target.refs && target.refs.main && target.refs.main.reload && target.refs.main.reload()
        };

        return result;
    }
    AClass.renderer(function (p) {
        const { id } = p.props, { data } = p.state;
        if (data instanceof Promise) return <div ref="root" className="flex-center flex-full-center">
            <Spinner />
        </div>;
        const protoype = Object.getPrototypeOf(this) || {};
        const { constructor } = protoype as any;
        const targetKey = Utils.isID(id) ? 'singleView' : 'listView';
        const componentClass = reinvent.templates[targetKey] as React.ComponentClass<any>;
        const result = AClass.applyChain(targetKey, p) as React.ReactElement<any>;
        const children = React.Children.toArray(result.props.children);

        const params = {
            ...p.props,
            ...(protoype && protoype.getForkData instanceof Function ? protoype.getForkData() : {}),
            ...(constructor && constructor.getForkData instanceof Function ? constructor.getForkData() : {})
        };
        const main = React.createElement(componentClass, { ref: "main", actions, params, options, customActions }, ...children);
        return <section ref="root" className="attached-root">{main}</section>;
    });
    AClass.preMatch = (args, url) => {
        if (!url.includes(':id')) return true;
        return Utils.isID(args.id);

    }
    return Object.assign(AClass, { options, getRenderParams, beforeSave, doneFunc, actions, dataLookupActions: actions, dataLookupOptions: options }) as any;
}
reinvent.factoryTable['frontend:crud'] = classFactory;