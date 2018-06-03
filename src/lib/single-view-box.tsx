/// <reference path="../organicUI.d.ts" />

import { BaseComponent } from './base-component';
import { templates, icon, i18n } from './shared-vars';
import { Utils } from './utils';

import { View } from './view';
import { Field } from './data';
import { listViews } from './shared-vars';
import { ReactElement, isValidElement } from 'react';
import { IDataListProps, DataList } from './data-list';
import { DataForm } from './data-form';
import { Spinner } from './spinner';
import { AdvButton, Placeholder } from './ui-kit';
import { DevFriendlyPort } from '../organicUI';
import OrganicBox from './organic-box';
const { OverflowSet, SearchBox, DefaultButton, css } = FabricUI;
interface SingleViewBoxProps<T> {
    actions: IActionsForCRUD<T>;
    customValidation?: (data: any) => IDataFormAccessorMsg[];
    singularName?, pluralName?: string;
    dataProps, children?
};
interface SingleViewBoxState { formData: any; validated: boolean; }
export class SingleViewBox<T> extends OrganicBox<SingleViewBoxProps<T>, SingleViewBoxState> {
    navigateToBack(): any {

        history.back();
    }
    refs: {
        dataForm: DataForm;

    }
    componentWillMount() {
        const { actions, dataProps } = this.props;
        this.state.formData = dataProps.id > 0
            ? actions.handleRead(dataProps.id).then(formData => this.repatch({ formData }))
            : {};
    }

    async handleSave() {
        this.repatch({ validated: true });

        const { dataForm } = this.refs;
        console.assert(!!dataForm, 'dataForm is null @ handleSave');
        await dataForm.revalidateAllFields();

        if (dataForm.invalidItems && dataForm.invalidItems[0]) {
            dataForm.setFocusByAcccesor(dataForm.invalidItems[0].accessor);
            return dataForm.getErrorCard();
        }
        const p = this.props, s = this.state;
        let updateResult: Promise<any>;

        if (p.actions.handleCreate instanceof Function)
            updateResult = !p.dataProps.id ? p.actions.handleCreate(s.formData) : p.actions.handleUpdate(p.dataProps.id, s.formData);
        else {
            return (<div className="error-callback" style={{ padding: '10px' }}><div className="title is-5 animated fadeIn">{i18n('error')}</div>
                <div className="animated fadeInDown">
                    {i18n('not impl')}
                </div>
            </div>);
        }
        return updateResult.then(
            () => {
                const { title, desc } = this.getSuccess();
                return <div className="single-view-callout" style={{ padding: '10px' }}>
                    <header className="columns">
                        <div className="column" style={{ maxWidth: "70px" }}>
                            <FabricUI.Icon iconName="SkypeCircleCheck" className="ms-font-su" />
                        </div>
                        <div className="column" style={{ display: 'flex', alignItems: 'center' }}>
                            <div className="title is-5">{title}</div>
                        </div>
                    </header>

                    <div className="columns">
                        <div className="column btn">
                            <FabricUI.DefaultButton   >{i18n('return')}</FabricUI.DefaultButton>
                        </div>
                        <div className="column desc  ">
                            {desc}
                        </div>
                    </div>

                    <div className="columns">
                        <div className="column btn">
                            <FabricUI.DefaultButton   >{i18n('keep')}</FabricUI.DefaultButton>
                        </div>
                        <div className="column desc ">

                        </div>
                    </div>
                    <div className="columns">
                        <div className="column btn">
                            <FabricUI.DefaultButton   >{i18n('add')}</FabricUI.DefaultButton>
                        </div>
                        <div className="column desc ">

                        </div>
                    </div>

                </div>;
            });




    }
    getSuccess() {
        const title = Utils.i18nFormat('success-title-save-fmt', { s: i18n.get(this.props.singularName) });
        const desc = Utils.i18nFormat('success-desc-save-fmt', { s: i18n.get(this.props.singularName), p: i18n.get(this.props.pluralName) });
        return { title, desc };
    }
    render(p = this.props) {

        const crudView = (this as any) as IViewsForCRUD<any>;
        const s = this.state;
        if (s.formData instanceof Promise) return <Spinner />;

        s.formData = s.formData || {};// p.actions.handleRead(this.props.id).then(formData => this.repatch({ formData } as any)) as any;
        return <section className="single-view" ref="root">
            <DevFriendlyPort target={this} targetText="SingleView" >
                <h1 className="title is-5 columns" style={{ margin: '0' }}>
                    <div className="column is-11">
                        {Utils.i18nFormat(p.dataProps.id > 0 ? 'edit-entity-fmt' : 'add-entity-fmt', { s: i18n.get(p.singularName) })}
                    </div>
                    <div className="column" style={{ maxWidth: '100px', direction: 'rtl' }}>
                        <FabricUI.ActionButton onClick={this.navigateToBack}   >
                            {' '}
                            {i18n('back')}
                            {' '}
                            <FabricUI.Icon iconName="Back" />

                        </FabricUI.ActionButton>
                    </div>
                </h1>
                <div className="main-content">
                    <DataForm ref="dataForm" onFieldRead={accessor => s.formData[accessor]}
                        onFieldWrite={(accessor, value) => s.formData[accessor] = value}
                        validate={s.validated}
                        customValidation={p.customValidation}
                        data={s.formData}>

                        {this.props.children}
                    </DataForm>
                    <footer className="buttons  single-view-buttons">
                        {/*<AdvButton buttonComponent={FabricUI.ActionButton}   onClick={() => {
                        const crudViews = (this as any) as IViewsForCRUD<any>;
                        return Utils.navigate(crudViews.getUrlForListView());
                    }}   > {i18n('return-to-listView')}</AdvButton>
                    
                    <AdvButton onClick={this.handleSave.bind(this)} primary  > {i18n('save-and-return')}</AdvButton>
                    */}

                        <AdvButton onClick={this.handleSave.bind(this)} primary  > {i18n('singleview-apply')}</AdvButton>

                    </footer>
                </div>
            </DevFriendlyPort>
        </section>

    }
    static prepareState(state: { formData, id }) {

    }
} 