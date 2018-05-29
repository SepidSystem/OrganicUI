/// <reference path="../organicUI.d.ts" />

import { BaseComponent } from './base-component';
import { templates, icon, i18n } from './shared-vars';
import { Utils } from './utils';

import { View } from './view';

import { listViews } from './shared-vars';
import { ReactElement } from 'react';
import { IDataListProps, DataList } from './data-list';

import { Spinner } from './spinner';
import { AdvButton, Placeholder } from './ui-kit';
import { DevFriendlyPort } from '../organicUI';
const { OverflowSet, SearchBox, DefaultButton, css } = FabricUI;
interface SingleViewBoxProps { actions: IActionsForCRUD<any>, dataProps, children?};
interface SingleViewBoxState { formData }
export class SingleViewBox extends BaseComponent<SingleViewBoxProps, SingleViewBoxState> {
    componentWillMount() {
        const { actions, dataProps } = this.props;
        this.state.formData = actions.handleRead(dataProps.id).then(formData => this.repatch({ formData }));
    }
    handleSave() {
        const p = this.props, s = this.state;
        let updateResult: Promise<any>;

        if (p.actions.handleCreate instanceof Function)
            updateResult = !p.dataProps.id ? p.actions.handleCreate(s.formData) : p.actions.handleUpdate(p.dataProps.id, s.formData);
        else {
            return Promise.resolve(2).then(
                () => (<div style={{ padding: '10px' }}><div className="title is-5 animated fadeIn">{i18n('error')}</div>
                    <div className="animated fadeInDown">
                        {i18n('not impl')}
                    </div>
                </div>));
        }
        return updateResult.then(
            () => (<div style={{ padding: '10px' }}><div className="title is-5 animated fadeIn">{i18n('success')}</div>
                <div className="animated fadeInDown">
                    {i18n('success')}
                </div>
            </div>));
    }
    render(p = this.props) {

        const crudView = (this as any) as IViewsForCRUD<any>;
        const s = this.state;
        s.formData = s.formData || {};// p.actions.handleRead(this.props.id).then(formData => this.repatch({ formData } as any)) as any;
        if (s.formData instanceof Promise) return <Spinner />;

        return <section className="single-view" ref="root">
            <DevFriendlyPort target={this} targetText="SingleView" >
                <OrganicUI.DataForm onFieldRead={accessor => s.formData[accessor]}
                    onFieldWrite={(accessor, value) => s.formData[accessor] = value}

                    data={s.formData}>

                    {this.props.children}
                </OrganicUI.DataForm>
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