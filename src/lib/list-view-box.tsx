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
import { IDetailsListProps } from 'office-ui-fabric-react';
const { OverflowSet, SearchBox, DefaultButton, css } = FabricUI;

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


export class OverflowSetForListView extends BaseComponent<any, any> {

    public render() {
        return (
            <OverflowSet

                items={[
                    {
                        key: 'newItem',
                        name: 'Add',
                        icon: 'Add',
                        ariaLabel: 'New. Use left and right arrow keys to navigate',
                        onClick: () => {
                            const listViewBox = (this.props.crud as any) as ListViewBox;
                            return Utils.navigate(listViewBox.getUrlForSingleView('new'));
                        }
                    },
                    {
                        key: 'edit',
                        name: 'Edit',
                        icon: 'Edit',
                        onClick: () => {
                            const listViewBox = (this.props.crud as any) as ListViewBox;
                            return listViewBox.handleEdit();
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
                text={i18n(OrganicUI.changeCase.paramCase(item.name)) as any}
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

interface ListViewBoxProps { actions: IActionsForCRUD<any>, children };
export class ListViewBox extends BaseComponent<ListViewBoxProps, any>{
    constructor(p) {
        super(p);
        this.handleActiveItemChanged = this.handleActiveItemChanged.bind(this);
    }
    getUrlForSingleView(id) {

        return location.pathname.split('/').concat([id]).join('/');
    }
    handleEdit() {
        const crudView = this as any as IViewsForCRUD<any>;
        const { currentRow } = this.state;
        if (!currentRow) {
            console.warn('currentRow is null');
            return;
        }
        const id = (currentRow.id);
        const url = this.getUrlForSingleView(id  );
        return OrganicUI.renderViewToComplete(url).then(() => Utils.navigate(url));
    }
    handleActiveItemChanged(currentRow) {
        this.repatch({ currentRow });
    }
    render() {
        const { repatch } = this;
        const queryNames = [];
        const paperType = 'sdfs';
        const crudView = (this as any) as IViewsForCRUD<any>;
        const onRowClick = (rowIdx, currentRow) => {

            //     currentRow && TemplateForCRUD.Instance && TemplateForCRUD.Instance.repatch({ currentRow })
        }
        const onRowSelect = ([currentRow]) => onRowClick(null, currentRow);

        const s = this.state as any;
        s.toggleButtons = s.toggleButtons || {};
        const children = React.Children.map(this.props.children, (child: any) => {
            if (child.type == DataList && !child.props.loader) {
                return React.cloneElement(child, Object.assign(
                    {}, child.props, {
                        // onRowClick, onRowSelect,
                        onActiveItemChanged: this.handleActiveItemChanged,
                        height: 600,
                        loader: this.props.actions.handleLoadData,
                        paginationMode: child.props.paginationMode || 'scrolled'
                    } as Partial<IDetailsListProps>))

            }
            return child;
        });


        return <section className="list-view"   >
            <DevFriendlyPort target={this} targetText="ListView" >

                {/*!!s.toggleButtons.showFilter && <Card header={"data-filter"} actions={['clear']}>
            </Card>*/}
                <header className=" static-height">
                    <OverflowSetForListView crud={this} />

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
                        {children}
                    </div>
                </div>
                <footer style={{ display: 'none' }} className="buttons static-height columns  ">
                    <div className="column is-9">
                        <AdvButton onClick={() => Utils.navigate(this.getUrlForSingleView('new'))}>
                            {Utils.showIconAndText('add')}
                        </AdvButton>
                        <AdvButton onClick={() => this.handleEdit()}>{Utils.showIconAndText('edit')}</AdvButton>
                        <AdvButton onClick={() => this.handleEdit()}>{Utils.showIconAndText('delete')}</AdvButton>
                    </div>
                    <div className="column is-3 ">
                        <AdvButton type="link" onClick={() => this.handleEdit()}>{icon('more')}</AdvButton>
                        <AdvButton type="link" onClick={() => this.handleEdit()}>{icon('settings')}</AdvButton>
                    </div>
                </footer>
                <br />


            </DevFriendlyPort>
        </section>;
    }
}
