/// <reference path="../organicUI.d.ts" />


import { templates, icon, i18n } from './shared-vars';
import { Utils } from './utils';
import { Field } from './data';
import { listViews } from './shared-vars';
import { ReactElement, isValidElement } from 'react';
import { IDataListProps, DataList } from './data-list';
import { DataForm } from './data-form';
import { Spinner } from './spinner';
import { AdvButton, Placeholder } from './ui-kit';
import OrganicBox from './organic-box';
import { route } from './router';
const { OverflowSet, SearchBox, DefaultButton, css } = FabricUI;


interface SingleViewBoxState { formData: any; validated: boolean; }

export class SingleViewBox<T> extends OrganicBox<
    IActionsForCRUD<T>, IOptionsForCRUD, ISingleViewParams, SingleViewBoxState> {
    constructor(p) {
        super(p);
        this.navigateToBack = this.navigateToBack.bind(this);
        this.navigateToNewItem = this.navigateToNewItem.bind(this);
        this.handleSave = this.handleSave.bind(this);
    }
    navigateToBack(): any {

        Utils.navigate(this.props.options.routeForListView)
    }
    refs: {
        dataForm: DataForm;
        primaryButton: AdvButton;
        secondaryButton: AdvButton;
    }
    mapFormData(formData) {
        if (this.props.params && this.props.params.id == ':id') {
            console.log('formData>>>>', formData);
        }
        return this.props.actions.mapFormData ? this.props.actions.mapFormData(formData) : formData;
    }
    componentWillMount() {
        const { actions, params } = this.props;
        this.state.formData = params.id > 0
            ? actions.handleRead(params.id).then(formData => this.repatch({ formData: this.mapFormData(formData) }))
            : this.mapFormData({});
    }

    async handleSave(navigateToListView?) {
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
        let { id } = p.params;
        if (id == 'new') id = 0;
        let formData = JSON.parse(JSON.stringify(s.formData));
        console.assert(!!p.actions.beforeSave || p.actions.beforeSave instanceof Function, 'p.actions.beforeSave is not function', p.actions.beforeSave);

        if (p.actions.beforeSave instanceof Function)
            formData = p.actions.beforeSave(formData);
        if (p.actions.handleCreate instanceof Function && p.actions.handleUpdate instanceof Function)
            updateResult = id > 0 ? p.actions.handleUpdate(id, formData) : p.actions.handleCreate(formData);
        else {
            return (<div className="error-callback" style={{ padding: '10px' }}><div className="title is-5 animated fadeIn">{i18n('error')}</div>
                <div className="animated fadeInDown">
                    {i18n('not impl handleUpdate & handleCreate')}
                </div>
            </div>);
        }
        return updateResult.then(
            () => {
                const { title, desc } = this.getSuccess();

                navigateToListView && setTimeout(() => this.navigateToBack(), 3000);
                setTimeout(() => this.refs.primaryButton.closeCallOut(), 2800);
                return <div className="single-view-callout" style={{ padding: '10px' }}>
                    <header className="columns">
                        <div className="column" style={{ maxWidth: "70px" }}>
                            <FabricUI.Icon iconName="SkypeCircleCheck" className="ms-font-su" />
                        </div>
                        <div className="column" style={{ display: 'flex', alignItems: 'center' }}>
                            <div className="title is-5">{title}</div>
                        </div>
                    </header>


                </div>;
            });




    }
    navigateToNewItem() {

        Utils.navigate(this.props.options.routeForListView.replace(':id', 'new'))
    }
    getSuccess() {
        const { options } = this.props;
        const args = { s: i18n.get(options.singularName), p: i18n.get(options.pluralName) };
        const title = Utils.i18nFormat('success-title-save-fmt', args);
        const desc = Utils.i18nFormat('success-desc-save-fmt', args);
        return { title, desc };
    }
    getDevButton() {
        return Utils.renderDevButton("SingleView", this);
    }
    renderContent(p = this.props) {

        const { options } = this.props;
        const s = this.state;
        if (s.formData instanceof Promise) return <Spinner />;

        s.formData = s.formData || {};// p.actions.handleRead(this.props.id).then(formData => this.repatch({ formData } as any)) as any;
        return <section className="single-view developer-features" ref="root">
            <h1 className="title is-5 columns" style={{ margin: '0' }}>
                <div className="column is-11">
                    {Utils.i18nFormat(p.params.id > 0 ? 'edit-entity-fmt' : 'add-entity-fmt', { s: i18n.get(options.singularName) })}
                </div>
                <div className="column" style={{ minWidth: '150px', direction: 'rtl' }}>
                    <MaterialUI.Button variant="outlined" onClick={this.navigateToBack}   >
                        {' '}
                        {i18n('back')}
                        {' '}
                        <FabricUI.Icon iconName="Back" />
                    </MaterialUI.Button >
                </div>
            </h1>
            <MaterialUI.Paper className="main-content">
                <DataForm ref="dataForm" onFieldRead={accessor => s.formData[accessor]}
                    onFieldWrite={(accessor, value) =>{
                        debugger;
                        s.formData[accessor] = value
                    }}
                    validate={s.validated}
                    customValidation={p.actions.customValidation}
                    data={s.formData}>

                    {this.props.children}
                </DataForm>
                <footer className="buttons  single-view-buttons">

                    {/*    
<AdvButton onClick={this.handleSave.bind(this)} primary ref="primaryButton" > {i18n('singleview-apply')}</AdvButton>
    */}
                    <AdvButton onClick={this.handleSave} variant="raised" color="primary" ref="primaryButton" > {i18n('save')}</AdvButton>
                    <AdvButton onClick={() => this.handleSave(true)} variant="raised" color="secondary" ref="secondaryButton"   > {i18n('save-and-exit')}</AdvButton>
                    <AdvButton onClick={this.navigateToBack}    > {i18n('cancel')}</AdvButton>

                </footer>
            </MaterialUI.Paper>

        </section>
    }

} 