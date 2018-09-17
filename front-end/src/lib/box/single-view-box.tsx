/// <reference path="../../dts/globals.d.ts" />
import { icon, i18n } from '../core/shared-vars';
import { Utils } from '../core/utils';
import { Field } from '../data/field';
import { listViews } from '../core/shared-vars';
import { ReactElement, isValidElement } from 'react';
import { DataForm } from '../data/data-form';
import { Spinner } from '../core/spinner';
import { AdvButton, Placeholder } from '../core/ui-elements';
import OrganicBox from './organic-box';
import { IActionsForCRUD, IOptionsForCRUD, ISingleViewParams } from '@organic-ui';
import { AppUtils } from '../core/app-utils';
import { createClientForREST } from '../core/rest-api';
import { DeveloperBar } from '../core/developer-features';
import { Icon, Paper, Button } from '../controls/inspired-components';
import { reinvent } from '../reinvent/reinvent';
interface SingleViewBoxState<T> { formData: T; validated: boolean; }

export class SingleViewBox<T> extends OrganicBox<
    IActionsForCRUD<T>, IOptionsForCRUD, ISingleViewParams, SingleViewBoxState<T>> {
    undefinedFields: Object;
    objectCreation: number;
    static fetchFail: Function;
    static monitorFunc: Function;
    static getMonitorFunc(): Function {
        const { monitorFunc } = SingleViewBox;
        return !!DeveloperBar.developerFriendlyEnabled && monitorFunc;
    }

    constructor(p) {
        super(p);
        this.handleFieldRead = this.handleFieldRead.bind(this);
        this.handleFieldWrite = this.handleFieldWrite.bind(this);
        this.handleNavigate = this.handleNavigate.bind(this);
        this.navigateToNewItem = this.navigateToNewItem.bind(this);
        this.handleSave = this.handleSave.bind(this);
        this.undefinedFields = {};
        this.objectCreation = +new Date();
    }
    handleNavigate(response?): any {
        const id = this.getId(response || this.state.formData);
        if (this.props.params && this.props.params.onNavigate) {
            return this.props.params.onNavigate(id);
        }
        const url = [this.props.options.routeForListView, id && ('selectedId=' + id)].filter(x => !!x).join('?');
        Utils.navigate(url);
    }
    refs: {
        dataForm: DataForm;
        primaryButton: AdvButton;
        secondaryButton: AdvButton;
    }
    mapFormData(formData) {
        return this.actions.mapFormData ? this.actions.mapFormData(formData) : formData;
    }
    componentWillMount() {
        const { actions, params } = this.props;
        const monitorFunc = SingleViewBox.getMonitorFunc();
        this.state.formData = params.id > 0
            ? actions.read(params.id)
                .then(data => monitorFunc instanceof Function ? monitorFunc('readData', data) : data)
                .then(formData => (formData = this.mapFormData(formData), this.repatch({ formData }), formData)
                    , error => {
                        this.devElement = this.makeDevElementForDiag(error);
                        this.repatch({})
                    }
                ).then(formData => this.actions.mapFormData ? monitorFunc('mapFormData', formData) : formData)

            : this.mapFormData({});
    }
    componentDidMount() {

        this.setPageTitle(this.getTitle());
    }
    getId(row) {
        if (this.actions.getId instanceof Function)
            return this.actions.getId(row);
        return Utils.defaultGetId(row);
    }
    getFormData(): T {
        const { formData } = this.state;
        if (formData instanceof Promise) return null;
        return formData;
    }
    setFieldValue(fieldName, value) {
        const formData = this.getFormData();
        formData && (formData[fieldName] = value);
    }

    async handleSave(navigateToListView?) {
        const p = this.props, s = this.state;
        this.repatch({ validated: true });

        const { dataForm } = this.refs;
        console.assert(!!dataForm, 'dataForm is null @ handleSave');
        let formData = JSON.parse(JSON.stringify(s.formData));
        if (!!this.actions.beforeSave)
            console.assert(this.actions.beforeSave instanceof Function, 'this.actions.beforeSave is not function', this.actions.beforeSave);

        if (this.actions.beforeSave instanceof Function)
            formData = await Utils.toPromise(this.actions.beforeSave(formData));
        const invalidItems = await Utils.toPromise(dataForm.revalidateAllFields(formData));
        if (invalidItems && invalidItems[0]) {
            dataForm.setFocusByAcccesor(invalidItems[0].accessor);
            return dataForm.showInvalidItems(invalidItems);
        }
        let updateResult: Promise<any>;
        let { id } = p.params;
        if (id == 'new') id = 0;
        const monitorFunc = SingleViewBox.getMonitorFunc();
        const debugResult = await Utils.toPromise(!!monitorFunc && monitorFunc('beforeSave', formData));
        console.assert(debugResult === -1, 'debugResult>>>>', { debugResult });
        if (this.actions.create instanceof Function && this.actions.update instanceof Function)
            updateResult = id > 0 ? this.actions.update(id, formData) : this.actions.create(formData);
        else {
            return (<div className="error-callback" style={{ padding: '10px' }}>
                <div className="title is-3 animated fadeInUp ">{i18n('error')}</div>
                <div className="animated fadeInDown">
                    {i18n('not impl update & create')}
                </div>
            </div>);
        }

        return updateResult
            .then(data => monitorFunc instanceof Function ? monitorFunc('afterSave', formData, id, this.actions) : data)
            .catch(error => {
                error = error.message || error;
                return Promise.resolve({ error })
            })
            .then(
                res => {
                    if (res.error) return <div className="server-side-error">
                        <i className="fa fa-exclamation-triangle"></i>
                        {res.error}</div>;
                    const { title, desc } = this.getSuccess();
                    if (navigateToListView)
                        setTimeout(this.handleNavigate.bind(this, res), 10);
                    else
                        setTimeout(() => this.refs.primaryButton.closeCallOut(), 2800);
                    return !navigateToListView && <div className="single-view-callout" style={{ padding: '3px' }}>
                        <header className="columns">
                            <div className="column" style={{ maxWidth: "70px" }}>
                                <span className="animated tada">
                                    <Icon iconName="SkypeCircleCheck" className="ms-font-su" />
                                </span>
                            </div>
                            <div className="column" style={{ display: 'flex', alignItems: 'center' }}>
                                <div className="title is-3">{title}</div>
                            </div>
                        </header>


                    </div>;
                }, error => (this.devElement = this.makeDevElementForDiag(error), this.repatch({})));




    }
    makeDevElementForDiag(error) {

        if (!SingleViewBox.fetchFail) return null;
        return SingleViewBox.fetchFail(Object.assign({}, createClientForREST['lastRequest'] || {}, {
            error, result: error,
            onProceed: () => (this.devElement = null, this.repatch({}))
        }))
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
    isFresh() {
        return (+new Date()) - this.objectCreation < 2500;
    }
    handleFieldWrite(accessor, value) {
        this.state.formData[accessor] = value;
        this.actions.onFieldWrite instanceof Function &&
            this.actions.onFieldWrite(accessor, value, this.state.formData);
    }
    handleFieldRead(accessor) {
        const val = this.state.formData[accessor];
        if (val === undefined && accessor) this.undefinedFields[accessor] = 1;
        if (this.isFresh() && val && accessor) delete this.undefinedFields[accessor];
        return val;

    }
    getTitle() {
        const p = this.props;
        return Utils.i18nFormat(p.params.id > 0 ? 'edit-entity-fmt' : 'add-entity-fmt', { s: i18n.get(p.options.singularName) })
    }
    renderContent(p = this.props) {

        const { options } = this.props;
        const s = this.state;
        if (s.formData instanceof Promise) return <Spinner />;

        s.formData = s.formData || {} as any;// this.actions.read(this.props.id).then(formData => this.repatch({ formData } as any)) as any;

        return <section className="organic-box single-view developer-features" ref="root">
            {!p.params.noTitle && <h1 className="animated fadeInUp  title is-3 columns" style={{ margin: '0', fontSize: '2.57rem' }}>
                <div className="column  " style={{ flex: '10' }}>
                    {this.getTitle()}
                </div>
                <div className="column" style={{ minWidth: '140px', maxWidth: '140px', paddingLeft: '0', paddingRight: '0', direction: 'rtl' }}>
                    {!p.params.onNavigate && <Button variant="raised" fullWidth className="singleview-back-btn button-icon-ux" onClick={this.handleNavigate}   >
                        {i18n('back')}
                        <Icon iconName="Back" />
                    </Button >}
                </div>
            </h1>}
            <Paper className="main-content">
                <DataForm ref="dataForm" onFieldRead={this.handleFieldRead}
                    onFieldWrite={this.handleFieldWrite}
                    validate={s.validated}
                    onErrorCode={this.actions.validate}
                    data={s.formData}>
                    {this.props.children}
                </DataForm>
                <footer className="buttons  single-view-buttons">
                    <AdvButton onClick={this.handleSave} variant="raised" color="primary" ref="primaryButton" > {i18n('save')}</AdvButton>
                    <AdvButton onClick={() => this.handleSave(true)} variant="raised" color="secondary" ref="secondaryButton"   > {i18n('save-and-exit')}</AdvButton>
                </footer>
            </Paper>

        </section>
    }
    static showDialogForAddNew(componentType: React.ComponentType<ISingleViewParams>): (() => Promise<any>) {
        return () => new Promise(resolve => {
            const props: ISingleViewParams = {
                id: 'new', onNavigate: id => {
                    AppUtils.closeDialog();
                    return resolve(id) as any;
                }
            };
            return AppUtils.showDialog(React.createElement(componentType, props), { hasScrollBar: true });
        });
    }
}
Object.assign(reinvent.templates, { singleView: SingleViewBox });
Object.assign(reinvent.utils, { showDialogForAddNew: SingleViewBox.showDialogForAddNew })