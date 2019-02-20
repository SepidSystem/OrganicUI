/// <reference path="../../dts/globals.d.ts" />


import OrganicBox from './organic-box';
import { Paper, Button } from '../controls/inspired-components';
import { FilterPanel } from '../data/filter-panel';
import { SelfBind } from '../core/decorators';
import { DataList } from '../data/data-list';
import { i18n } from '../core/shared-vars';
import * as printerIcon from '../../../icons/printer.svg';
import * as fullScreen from '../../../icons/full-screen.svg';
import * as fullScreenExit from '../../../icons/full-screen-exit.svg';
interface ReportViewBoxProps {

};
interface ReportViewBoxState {
    formData: any; validated: boolean;
    fullScreen: boolean;
}
export class ReportViewBox extends OrganicBox<any, any, any, ReportViewBoxState> {

    refs: {
        filterPanel: FilterPanel;
        datalist: DataList;
    }
    @SelfBind()
    handleApplyClick() {
        const { datalist } = this.refs;

        return datalist && datalist.reload instanceof Function && datalist.reload();
    }
    handleLoadRequestParams(params: OrganicUi.IAdvancedQueryFilters) {
        const filterPanel = this.querySelectorAll<FilterPanel>('.filter-panel')[0];
        if (filterPanel) {
            const filterModel = filterPanel.getFilterItems()
            params.filterModel = filterModel instanceof Array ? filterModel.filter(filterItem => !Utils.isUndefined(filterItem.value)) : filterModel;

            if (filterModel instanceof Array && this.props.params.dataLookupProps && this.props.params.dataLookupProps.filterModelAppend instanceof Array && params.filterModel instanceof Array)
                params.filterModel.push(...this.props.params.dataLookupProps.filterModelAppend);
            if (params.filterModel instanceof Array &&  params.filterModel.length == 0) {
                Utils.showErrorMessage(i18n.get('filter-is-empty'));
                return;
            }
            const { onLoadRequestParams } = ((this.dataListElement && this.dataListElement.props) || {}) as any;
            return onLoadRequestParams instanceof Function ? onLoadRequestParams(params) : params;
        }
    }
    isDataListTargeted(child: React.ClassicElement<any>) {
        return child && child.type && child.type['isDataList'] && !child.props.loader;
    }
    dataListElement: DataList;
    prepareDataList(dataListElement) {
        this.dataListElement = dataListElement;
        return !Utils.fakeLoad() && React.cloneElement(dataListElement,
            {
                loader: dataListElement.props.loader || this.actions.read,
                height: 700,
                ref: "datalist",
                onLoadRequestParams: this.handleLoadRequestParams.bind(this),
                startWithEmptyList: true
            } as Partial<OrganicUi.IDataListProps>)
    }
    componentDidMount() {

        this.props.options && this.setPageTitle(i18n.get(this.props.options.title));
        for (const filterPanel of this.querySelectorAll<FilterPanel>('.filter-panel'))
            filterPanel.assignValuesFromQueryString(location.search);

    }
    renderContent(p = this.props) {
        const handleApplyClick = this.handleApplyClick.bind(this);
        let children = React.Children.toArray(this.props.children) as any[];
        children = children.map(child => {
            if (child && (child.type == FilterPanel))
                return React.cloneElement(child, { onApplyClick: handleApplyClick, ref: "filterPanel" } as Partial<OrganicUi.IFilterPanelProps>);
            return child;
        });
        const dataList = children.filter(this.isDataListTargeted).map(dataListElement => this.prepareDataList(dataListElement));

        return (<section ref="root" style={{ flex: 1, flexDirection: 'column', display: 'flex' }}>

            <CriticalContent permissionValue={p.options && p.options.permissionKey} permissionKey="report-permission" >
                {!this.state.fullScreen && children.filter(child => !this.isDataListTargeted(child))}
                {!!dataList && !!dataList[0] && <>
                    <br /> <Paper className="main-content">
                        <header className="navigator" style={{ display: 'flex' }}>
                            {this.renderNavigator()}
                        </header>

                        {dataList}
                        <br /><br />
                    </Paper>
                </>}
            </CriticalContent>
        </section>);

    }
    renderNavigator() {
        return <>
            <span style={{ minWidth: '2100p' }}></span>

            <div style={{ flex: '1' }}></div>
            <Button onClick={ListViewBox.prototype.handleToggleFullScreen.bind(this)} className="testable__fullScreen">
                {Utils.showIcon({ svg: this.state.fullScreen ? fullScreenExit : fullScreen, width: '3rem' })}
            </Button>
            <AdvButton onClick={ListViewBox.prototype.handleExcelExport.bind(this)}>
                <div dangerouslySetInnerHTML={{ __html: printerIcon }} style={{ width: '3rem', margin: '0.2rem' }} />
                {i18n('export')}
            </AdvButton>

        </>
    }

}
import { reinvent } from '../reinvent/reinvent';
import { Utils } from '../core/utils';
import { CriticalContent } from '../core/base-component';
import { AdvButton } from "../controls/adv-button";
import { ListViewBox } from './list-view-box';
Object.assign(reinvent.templates, { 'report-view': ReportViewBox });