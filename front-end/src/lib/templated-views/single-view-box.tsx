/// <reference path="../../dts/globals.d.ts" />
import { icon, i18n } from '../core/shared-vars';
import { Utils } from '../core/utils';
import { checkPermission } from '../core/permission-management';
import { DataForm } from '../data/data-form';
import { Spinner } from '../core/spinner';
import { AdvButton } from '../controls/adv-button';
import OrganicBox from './organic-box';
import { IActionsForCRUD, IOptionsForCRUD, ISingleViewParams } from '@organic-ui';
import { AppUtils } from '../core/app-utils';
import { createClientForREST } from '../core/rest-api';
import { DeveloperBar } from '../core/developer-features';
import { Icon, Paper, Button, Alert } from '../controls/inspired-components';
import { reinvent } from '../reinvent/reinvent';
import { SelfBind } from '../core/decorators';
import Svg from '../controls/svg';
import *as ArrowLeftSvg from './arrow-left.svg'
import { IErrorItem, errorTranslationServices } from './error-translation';
interface IState<T> {
    id: any;
    formData: T; validated: boolean;
    initialFormData: T;
    formKey: number;
}

export class SingleViewBox<T> extends OrganicBox<
    IActionsForCRUD<T>, IOptionsForCRUD, ISingleViewParams, IState<T>> {
    undefinedFields: Object;
    objectCreation: number;
    static fetchFail: Function;
    static monitorFunc: Function;
    static TranslateError(errorItem: IErrorItem) {
        if (typeof errorItem == 'string') return errorItem;
        if (errorItem.message && errorItem.argument) {
            for (const service of errorTranslationServices)
                if (service.check(errorItem)) return service.translate(errorItem);
        }
        console.log({ errorItem });
    }
    static getMonitorFunc(): Function {
        const { monitorFunc } = SingleViewBox;
        return !!DeveloperBar.developerFriendlyEnabled && monitorFunc;
    }

    constructor(p) {
        super(p);
        this.undefinedFields = {};
        this.objectCreation = +new Date();
    }
    @SelfBind()
    handleNavigate(response?): any {

        const id = this.getId(response || this.state.formData);
        if (this.props.params && this.props.params.onNavigate) {
            return this.props.params.onNavigate(id);
        }
        const url = [this.props.options.routeForListView,
        [id && ('selectedId=' + id), 'restoreState=1'].filter(notFalse => notFalse).join('&')].filter(x => !!x).join('?');
        return !!response && Utils.navigate(url);
    }
    refs: {
        root: HTMLElement;
        dataForm: DataForm;
        primaryButton: AdvButton;
        secondaryButton: AdvButton;
    }
    mapFormData(formData) {
        if (this.state.id && !this.state.initialFormData)
            setTimeout(() => this.repatch({ initialFormData: Utils.clone(this.getFormData()) }), 300);
        return this.actions.mapFormData ? this.actions.mapFormData(formData) : formData;
    }
    componentWillMount() {
        const { actions, params } = this.props;
        this.state.id = params.id;
        const monitorFunc = SingleViewBox.getMonitorFunc();
        this.state.formData = params.id > 0
            ? actions.read(params.id)
                .then(data => monitorFunc instanceof Function ? monitorFunc('readData', data) : data)
                .then(formData => (formData = this.mapFormData(formData), this.repatch({ formData }), formData)
                    , error => {
                        this.devElement = this.makeDevElementForDiag(error);
                        this.repatch({});
                    }
                ).then(formData => this.actions.mapFormData && monitorFunc instanceof Function ? monitorFunc('mapFormData', formData) : formData)

            : this.mapFormData({});
    }
    componentDidMount() {
        super.componentDidMount();
        this.setPageTitle(this.getTitle());
        if (this.state.id && !this.state.initialFormData)
            setTimeout(() => this.repatch({ initialFormData: Utils.clone(this.getFormData()) }), 1500);
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
    addNewMode() {
        return this.state.id == 'new';
    }
    handleAnchorForErrorClick(e: React.MouseEvent<HTMLElement>) {
        e.preventDefault();
        const { currentTarget } = e;
        const argument = currentTarget.getAttribute('data-argument');
        this.refs.dataForm.setFocusByAcccesor(argument);
    }
    renderError(error) {
        if (!error) return null;
        const { errors } = error;
        if (errors instanceof Array) {
            return <ul>
                {errors.filter(notFalse => notFalse).slice(0, 5).map(err => <li>
                    <a href="#" onClick={this.handleAnchorForErrorClick.bind(this)} data-argument={err.argument}>
                        {SingleViewBox.TranslateError(err)}
                    </a></li>)}
            </ul>
        }
        return error;
    }
    @SelfBind()
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
        const { id } = this.state;
        const monitorFunc = SingleViewBox.getMonitorFunc();
        const debugResult = await Utils.toPromise(!!monitorFunc && monitorFunc('beforeSave', formData));
        //console.assert(debugResult === -1, 'debugResult>>>>', { debugResult });
        if (this.actions.create instanceof Function && this.actions.update instanceof Function)
            updateResult = !this.addNewMode() ? this.actions.update(id, formData) : this.actions.create(formData);
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
                console.log(({ error }));
                error = error.message || error;
                return Promise.resolve({ error })
            })
            .then(
                async res => {
                    if (res.id)
                        res.id = +res.id;
                    if (this.state.id == 'new' && res.id) {
                        history.replaceState(null, document.title, location.href.replace('/new', '/' + res.id));
                    }
                    this.state.id = res.id || this.state.id;

                    formData.id = res.id || formData.id;
                    console.log({ res, formData });
                    const entity = await this.props.actions.read(formData.id);

                    this.querySelectorAll('*')
                        .filter(c => c && c.resetData instanceof Function)
                        .forEach(c => c.resetData());
                    this.repatch({ formData: this.mapFormData(entity), formKey: +new Date() });

                    if (res.error) return <div className="server-side-message">
                        <i className="fa fa-exclamation-triangle center-content" style={{ fontSize: '40px' }}></i>
                        <p style={{ whiteSpace: 'pre-line' }}>{this.renderError(res.error)}</p>
                    </div>;
                    const { title, desc } = this.getSuccess();
                    if (navigateToListView)
                        setTimeout(this.handleNavigate.bind(this, res), 10);
                    else
                        setTimeout(() => this.refs.primaryButton.closeCallOut(), 2800);
                    return !navigateToListView && Utils.successCallout(title);
                }, error => (this.devElement = this.makeDevElementForDiag(error), this.repatch({})));




    }
    makeDevElementForDiag(error) {

        if (!SingleViewBox.fetchFail) return null;
        return SingleViewBox.fetchFail(Object.assign({}, createClientForREST['lastRequest'] || {}, {
            error, result: error,
            onProceed: () => (this.devElement = null, this.repatch({}))
        }))
    }
    @SelfBind()
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
    getTitle() {
        const p = this.props;
        return Utils.i18nFormat(p.params.id > 0 ? 'edit-entity-fmt' : 'add-entity-fmt', { s: i18n.get(p.options.singularName) })
    }
    static lastBeforeNavigateOccur = 0;
    async beforeNavigate(checkOnlyFormChanged: boolean) {
        const { initialFormData, formData } = this.state;
        const formChanged = !!initialFormData && !!formData &&
            !Utils.equals(initialFormData, formData);
        if (checkOnlyFormChanged) return formChanged;
        if (!formChanged) return Promise.resolve(true);
        const userReaction = await Alert({ type: 'question', text: i18n.get('are-you-sure'), showCancelButton: true });
        SingleViewBox.lastBeforeNavigateOccur = +new Date();
        return (userReaction && userReaction.value) ? Promise.resolve(true) : Promise.reject('cancel-by-user');

    }
    renderContent(p = this.props) {

        const { options } = this.props;
        const s = this.state;
        if (s.formData instanceof Promise) return <Spinner />;

        s.formData = s.formData || {} as any;// this.actions.read(this.props.id).then(formData => this.repatch({formData} as any)) as any;
        const hasModifyPermission = (!options.permissionKeys || checkPermission(this.addNewMode() ? options.permissionKeys.forCreate : options.permissionKeys.forUpdate));
        if (!hasModifyPermission && this.refs.root) {

        }
        return (<section className="organic-box single-view developer-features" ref="root">
            {!p.params.noTitle && <h1 className="animated fadeInUp  title is-3 columns" style={{ margin: '0', fontSize: '2.57rem' }}>
                <div className="column  " style={{ flex: '10' }}>
                    {this.getTitle()}
                </div>
                <div className="column" style={{ minWidth: '140px', maxWidth: '140px', paddingLeft: '0', paddingRight: '0', direction: 'rtl' }}>
                    {!p.params.onNavigate && <Button variant="raised" fullWidth className="singleview-back-btn button-icon-ux" onClick={this.handleNavigate}   >
                        {i18n('back')}
                        <Svg image={ArrowLeftSvg} width={32} height={32} />
                    </Button >}
                </div>
            </h1>}
            <Paper className="main-content">
                <DataForm ref="dataForm"
                    validate={s.validated}
                    onErrorCode={this.actions.validate}
                    data={s.formData}
                    key={s.formKey || 0}
                >
                    {React.Children.toArray(this.props.children).filter((c: any) => c && c.props && !c.props['role'])}
                </DataForm>
                {hasModifyPermission &&
                    <footer className="buttons  single-view-buttons">
                        <AdvButton onClick={this.handleSave.bind(this, false)} variant="raised" color="primary" ref="primaryButton" > {i18n('save')}</AdvButton>
                        <AdvButton onClick={this.handleSave.bind(this, true)} variant="raised" color="secondary" ref="secondaryButton"   > {i18n('save-and-exit')}</AdvButton>
                        <div style={{ flex: 1 }}></div>
                        {this.childrenByRole['nav']}
                    </footer>}
            </Paper>

        </section>)
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
window.onbeforeunload = e => {
    const dom = (document.querySelector('.organic-box.single-view') || {}) as any;

    const { componentRef } = dom;
    if (componentRef instanceof SingleViewBox && componentRef.beforeNavigate(true))
        return i18n.get('are-you-sure');
}

