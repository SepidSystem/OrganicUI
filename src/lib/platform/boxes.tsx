/// <reference path="../../platform.d.ts" />

import * as React from "react";
import { Component } from 'react';
import { templates, icon, i18n, showIconText, Utils, showIconAndText } from '../../core'
const { Panel } = Core.Components;

const { View } = Core;

import { listViews } from '../../platform';
import { ReactElement } from 'react';
import { IDataListProps } from '../ui-kit/data-list';

import { navigate } from '../utils';
const { Spinner } = Core;
const { AdvButton, Placeholder } = Core.UiKit;
const { OverflowSet, SearchBox, DefaultButton, css } = Core.FabricUI;

export interface TemplateForCRUDProps extends React.Props<any> {
    id: string;
    mode: 'single' | 'list';
}
let debounceTimer: any;
const debounce = cb => {
    debounceTimer && clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => (cb(), debounceTimer = 0), 100);
}

function storeToggleButtons(v) {

}


export class OverflowSetCustomExample extends Core.BaseComponent<any, any> {

    public render() {
        return (
            <OverflowSet
                className=" static-height"

                items={[
                    {
                        key: 'newItem',
                        name: 'New',
                        icon: 'Add',
                        ariaLabel: 'New. Use left and right arrow keys to navigate',
                        onClick: () => {
                            const crudViews = (this.props.crud as any) as IViewsForCRUD<any>;
                            return Utils.navigate(crudViews.getUrlForSingleView('new'));
                        }
                    },
                    {
                        key: 'edit',
                        name: 'Edit',
                        icon: 'Edit',
                        onClick: () => {
                            const crudViews = (this.props.crud as any);
                            return crudViews.handleEdit();
                        },
                    },
                    {
                        key: 'delete',
                        name: 'Delete',
                        icon: 'Delete',
                        onClick: () => { return; }
                    }
                ]}
                overflowItems={
                    Array.from({ length: 4 }, (_, idx) => ({
                        key: 'newItem',
                        name: 'Action#1',
                        icon: 'Add',
                        ariaLabel: 'New. Use left and right arrow keys to navigate',
                        onClick: () => { return; }
                    }))

                }
                onRenderOverflowButton={this._onRenderOverflowButton}
                onRenderItem={this._onRenderItem}
            />
        );
    }

    private _onRenderItem(item): JSX.Element {
        if (item.onRender) {
            return (
                item.onRender(item)
            );
        }
        return (
            <AdvButton
                iconProps={{ iconName: item.icon }}
                menuProps={item.subMenuProps}
                onClick={item.onClick}
                text={item.text}
            >{null}</AdvButton>
        );
    }

    private _onRenderOverflowButton(overflowItems: any[] | undefined): JSX.Element {
        return (
            <DefaultButton
                menuIconProps={{ iconName: 'More' }}
                menuProps={{ items: overflowItems! }}
            />
        );
    }
}

interface SingleViewBoxProps { actions: IActionsForCRUD<any>, id, children?};
interface SingleViewBoxState { formData }
export class SingleViewBox extends Core.BaseComponent<SingleViewBoxProps, SingleViewBoxState> {
    handleSave() {
        const p = this.props, s = this.state;
        let updateResult: Promise<any>;
        if (p.actions.handleCreate instanceof Function)
            updateResult = !p.id ? p.actions.handleCreate(s.formData) : p.actions.handleUpdate(p.id, s.formData);
        else updateResult = Promise.resolve(2);
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
        Object.assign(window, { box: this });
        return <section className="single-view" >
            <Core.UiKit.DataForm onGet={accessor => s.formData[accessor]} onSet={(accessor, value) => s.formData[accessor] = value} >
                {this.props.children}
            </Core.UiKit.DataForm>
            <footer className="buttons is-centered">
                <AdvButton onClick={this.handleSave.bind(this)} primary  > {i18n('save')}</AdvButton>
                <AdvButton onClick={() => {
                    const crudViews = (this as any) as IViewsForCRUD<any>;
                    return Utils.navigate(crudViews.getUrlForListView());
                }}   > {i18n('cancel')}</AdvButton>
            </footer>
        </section>

    }
    static prepareState(state: { formData, id }) {

    }
}
interface ListViewBoxProps { actions: IActionsForCRUD<any>, children };
export class ListViewBox extends Core.BaseComponent<ListViewBoxProps, any>{
    static prepareState(s) {

    }
    handleEdit() {
        const crudView = this as any as IViewsForCRUD<any>;
        const { currentRow } = this.state;
        if (!currentRow) {
            console.warn('currentRow is null');
            return;
        }
        const id = crudView.getId(currentRow);
        const url = crudView.getUrlForSingleView(id || 'new');
        return Core.renderViewToComplete(url).then(() => navigate(url));
    }
    render() {
        const { repatch } = this;
        const queryNames = [];
        const paperType = 'sdfs';
        const crudView = (this as any) as IViewsForCRUD<any>;

        const children = this.props.children as any;

        const s = this.state as any;
        s.toggleButtons = s.toggleButtons || {};
        let dataList = crudView.renderListView();
        const onRowClick = (rowIdx, currentRow) => {

            //     currentRow && TemplateForCRUD.Instance && TemplateForCRUD.Instance.repatch({ currentRow })
        }
        const onRowSelect = ([currentRow]) => onRowClick(null, currentRow);
        dataList = dataList && React.cloneElement(dataList, Object.assign(
            {}, dataList.props, {
                onRowClick, onRowSelect,
                paginationMode: dataList.props.paginationMode || 'scrolled'
            }))

        return <section className="list-view"   >


            {/*!!s.toggleButtons.showFilter && <Card header={"data-filter"} actions={['clear']}>
            </Card>*/}
            <header>
                <OverflowSetCustomExample crud={this} />

            </header>
            <div className=" ">
                {s.toggleButtons.showCats && <div className="column is-4">
                    <div className="tags is-vcentered">
                        <span className="tag ">
                            {'  '}World{'  '}
                            <button className="delete is-small"></button>
                        </span>
                    </div>
                    <div className="select" style={{ width: '49%', marginBottom: '4px' }}>
                        <select className="" style={{ width: '100%' }}>
                            {['area', 'earned', 'payment', ''].map(s => <option className="">{s}</option>)}

                        </select>

                    </div>{' '}
                    <div className="select" style={{ width: '49%', marginBottom: '4px' }}>
                        <select className="" style={{ width: '100%' }}>
                            {['SUM', 'MAX', 'MIN', 'AVG'].map(s => <option className="">{s}</option>)}

                        </select>

                    </div>

                </div>}

                <div className="  column no-padding"   >
                    {dataList}
                </div>
            </div>
            <footer style={{ display: 'none' }} className="buttons static-height columns  ">
                <div className="column is-9">
                    <AdvButton onClick={() => {
                        const { actions } = this.props;
                        return Utils.navigate(actions.getUrlForSingleView('new'));
                    }}>
                        {showIconAndText('add')}
                    </AdvButton>
                    <AdvButton onClick={() => this.handleEdit()}>{showIconAndText('edit')}</AdvButton>
                    <AdvButton onClick={() => this.handleEdit()}>{showIconAndText('delete')}</AdvButton>
                </div>
                <div className="column is-3 ">
                    <AdvButton type="link" onClick={() => this.handleEdit()}>{icon('more')}</AdvButton>
                    <AdvButton type="link" onClick={() => this.handleEdit()}>{icon('settings')}</AdvButton>
                </div>
            </footer>
            <br />



        </section>;
    }
}
