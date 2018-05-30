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
const { OverflowSet, SearchBox, DefaultButton, css } = FabricUI;
interface SingleViewBoxProps {
    actions: IActionsForCRUD<any>;
    customValidation?: (data: any) => IDataFormAccessorMsg[];
    dataProps, children?
};
interface SingleViewBoxState { formData: any; validated: boolean; }
export class SingleViewBox extends BaseComponent<SingleViewBoxProps, SingleViewBoxState> {
    refs: {
        dataForm: DataForm;

    }
    componentWillMount() {
        const { actions, dataProps } = this.props;
        this.state.formData = actions.handleRead(dataProps.id).then(formData => this.repatch({ formData }));
    }
    setFocusByAcccesor(accessor) {

        this.querySelectorAll<Field>('.field-accessor').filter(fld => fld.props.accessor == accessor).forEach(fld => {
            fld.refs.root.classList.add('field-targeted');
            Utils.scrollTo(document.body, fld.refs.root.clientTop, 100);
            fld.refs.root.querySelector('input').focus();
            setTimeout(() => fld.refs.root.classList.remove('field-targeted'), 1500);
        })
    }
    handleSave() {
        this.repatch({ validated: true });

        const { dataForm } = this.refs;
        console.assert(!!dataForm, 'dataForm is null @ handleSave');
        return dataForm.revalidateAllFields().then(_ => {
            if (dataForm.invalidItems && dataForm.invalidItems.length) {
                this.setFocusByAcccesor(dataForm.invalidItems[0].accessor);
                return (<div style={{ padding: '10px' }}><div className="title is-5 animated fadeIn">{i18n('error')}</div>
                    <div className="animated fadeInDown">
                        <ul className="invalid-items">
                            {dataForm.invalidItems.map(invalidItem => (<li className="invalid-item">
                                <a href="#" onClick={e => {
                                    e.preventDefault();
                                    this.setFocusByAcccesor(invalidItem.accessor);
                                }}>
                                    <label >{i18n(OrganicUI.changeCase.paramCase(invalidItem.accessor))}</label>
                                    <span>{i18n(invalidItem.message)}</span>
                                </a>
                            </li>
                            ))}
                        </ul>
                    </div>
                </div>);
            }
            const p = this.props, s = this.state;
            let updateResult: Promise<any>;

            if (p.actions.handleCreate instanceof Function)
                updateResult = !p.dataProps.id ? p.actions.handleCreate(s.formData) : p.actions.handleUpdate(p.dataProps.id, s.formData);
            else {
                return (<div style={{ padding: '10px' }}><div className="title is-5 animated fadeIn">{i18n('error')}</div>
                    <div className="animated fadeInDown">
                        {i18n('not impl')}
                    </div>
                </div>);
            }
            return updateResult.then(
                () => (<div style={{ padding: '10px' }}><div className="title is-5 animated fadeIn">{i18n('success')}</div>
                    <div className="animated fadeInDown">
                        {i18n('success')}
                    </div>
                </div>));
        });



    }
    render(p = this.props) {

        const crudView = (this as any) as IViewsForCRUD<any>;
        const s = this.state;
        s.formData = s.formData || {};// p.actions.handleRead(this.props.id).then(formData => this.repatch({ formData } as any)) as any;
        if (s.formData instanceof Promise) return <Spinner />;

        return <section className="single-view" ref="root">
            <DevFriendlyPort target={this} targetText="SingleView" >
                <DataForm ref="dataForm" onFieldRead={accessor => s.formData[accessor]}
                    onFieldWrite={(accessor, value) => s.formData[accessor] = value}
                    validate={s.validated}
                    customValidation={p.customValidation}
                    data={s.formData}>

                    {this.props.children}
                </DataForm>
                <footer className="buttons is-centered">
                    <AdvButton onClick={this.handleSave.bind(this)} primary  > {i18n('save')}</AdvButton>
                    <AdvButton onClick={() => {
                        const crudViews = (this as any) as IViewsForCRUD<any>;
                        return Utils.navigate(crudViews.getUrlForListView());
                    }}   > {i18n('cancel')}</AdvButton>
                </footer>
            </DevFriendlyPort>
        </section>

    }
    static prepareState(state: { formData, id }) {

    }
} 