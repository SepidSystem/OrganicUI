import * as React from "react";
import { Component } from 'react';
import { templates, icon, i18n, showIconText, Utils, showIconAndText } from '../../organicUI'
const { Panel } = OrganicUI.Components;

const { View } = OrganicUI;

import { listViews } from '../../platform';
import { ReactElement } from 'react';
import { IDataListProps } from '../ui-kit/data-list';

import { navigate } from '../utils';
const { Spinner } = OrganicUI;
const { AdvButton } = OrganicUI.UiKit;
const { OverflowSet, SearchBox, DefaultButton, css } = OrganicUI.FabricUI;

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

interface IPartialStateForCRUD<TDto> {
    currentRow: TDto;
    formData: TDto;
    currentMainContainerHeight: number;
    adjustedDataListHeight: number;
}
export class OverflowSetCustomExample extends OrganicUI.BaseComponent<any, any> {

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
export class TemplateForCRUD<TState, TDto, TApi> extends OrganicUI.ViewWithFluentAPI<TState & IPartialStateForCRUD<TDto>, TApi>
{
    adjustTimeOutId: any;
    state: TState & IPartialStateForCRUD<TDto>;
    static Template = 'base';

    static Instance: TemplateForCRUD<any, any, any>;
    props: TemplateForCRUDProps;
    isListViewMode() {
        const { props } = this;

        return props.mode == 'list';
    }
    getDataListHeight() {

    }
    handleEdit() {
        const crudView = this as any as IViewsForCRUD<TDto>;
        const { currentRow } = this.state;
        if (!currentRow) {
            console.warn('currentRow is null');
            return;
        }
        const id = crudView.getId(currentRow);
        const url = crudView.getUrlForSingleView(id || 'new');
        return OrganicUI.renderViewToComplete(url).then(() => navigate(url));
    }
    componentDidMount(){ 
        this.adjustLayout()
      
    }
    renderContent(p = this.props) {
      
        this.adjustTimeOutId = this.adjustTimeOutId || setTimeout(() => {
            this.adjustLayout()
        }, 300);
        TemplateForCRUD.Instance = this;
        const crudView = (this as any) as IViewsForCRUD<TDto>;
        crudView.getId = crudView.getId || function (row: any) { return row.id }
        crudView.getUrlForSingleView = crudView.getUrlForSingleView || function (id) {
            const parts = location.href.split('/');
            return parts.concat([id]).join('/');
        }
        crudView.getUrlForListView = crudView.getUrlForListView || function () {
            const parts = location.href.split('/');
            let result = parts
                .filter(part => part === '' || (part != +part as any))
                .join('/');
            if (result.endsWith('/new')) result = result.slice(0, result.length - 4);
            return result;
        }
        return [p.mode == 'list' && this.renderContentForListView(),
        p.mode == 'list' && this.renderContentForListView(),
        p.mode == 'single' && this.renderContentForSingleView(),
        <div className="title is-1">${p.mode || 'null'} is not invalid,please set valid props.mode </div>].
            filter(x => !!x)[0];

    }

    renderContentForSingleView() {
        const handleSave = () => {
            const crudView = (this as any) as IViewsForCRUD<TDto>;
            const { id } = this.props;
            const { formData } = this.state;

            const updateResult = !!id ? crudView.handleUpdate(id, formData) : crudView.handleCreate(formData);

            return updateResult.then(() => (<div style={{ padding: '10px' }}><div className="title is-5 animated fadeIn">{i18n('success')}</div>
                <div className="animated fadeInDown">
                    {i18n('success')}
                </div>
            </div>
            )
                //navigate(crudView.getUrlForListView())1
            );
        }
        const crudView = (this as any) as IViewsForCRUD<TDto>;
        const s = this.state as IPartialStateForCRUD<TDto>;

        s.formData = s.formData || crudView.handleRead(this.props.id).then(formData => this.repatch({ formData } as any)) as any;
        if (s.formData instanceof Promise) return <Spinner />;
        //Object.assign(window,{vv:this})
        return <section className="single-view" >

            {!!crudView.renderSingleView && crudView.renderSingleView(s.formData)}
            <footer className="buttons is-centered">
                <AdvButton onClick={handleSave} primary  > {i18n('save')}</AdvButton>
                <AdvButton onClick={() => {
                    const crudViews = (this as any) as IViewsForCRUD<TDto>;
                    return Utils.navigate(crudViews.getUrlForListView());
                }}   > {i18n('cancel')}</AdvButton>
            </footer>
        </section>

    }
    adjustedDataListHeightTimeoutId: any;
    adjustLayout() {
        const mainContainer = document.querySelector('.main-container');
        if (mainContainer && mainContainer.clientHeight != this.state.currentMainContainerHeight) {
            const currentMainContainerHeight = mainContainer.clientHeight;
            Object.assign(this.state, { currentMainContainerHeight });
            const totalStaticHeight = Array.from(document.querySelectorAll('.static-height')).map(c => c.clientHeight).reduce((a, b) => a + b, 20);
            this.adjustedDataListHeightTimeoutId &&
                clearTimeout(this.adjustedDataListHeightTimeoutId);
            this.adjustedDataListHeightTimeoutId = setTimeout(() => {
                this.adjustedDataListHeightTimeoutId = null;
                this.repatch({ adjustedDataListHeight: currentMainContainerHeight - totalStaticHeight } as any)
            }, 500);

        }

    }
    renderContentForListView() {
        const { repatch } = this;
        const queryNames = [];
        const paperType = 'sdfs';
        const crudView = (this as any) as IViewsForCRUD<TDto>;

        const children = this.props.children as any;

        const s = this.state as any;
        s.toggleButtons = s.toggleButtons || {};
        let dataList = crudView.renderListView();
        const onRowClick = (rowIdx, currentRow) => {

            currentRow && TemplateForCRUD.Instance && TemplateForCRUD.Instance.repatch({ currentRow })
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
                        const crudViews = (this as any) as IViewsForCRUD<TDto>;
                        return Utils.navigate(crudViews.getUrlForSingleView('new'));
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
templates.set('crud', TemplateForCRUD as any); 1


if (window) {
    window.addEventListener('resize', ev => {
        if (View.Instance && (View.Instance as any).isListViewMode instanceof Function &&
            (View.Instance as any).isListViewMode()) {
            (View.Instance as any).adjustLayout();
        }
    });
}