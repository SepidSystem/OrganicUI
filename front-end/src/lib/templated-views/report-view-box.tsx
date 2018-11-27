/// <reference path="../../dts/globals.d.ts" />


import OrganicBox from './organic-box';
import { Paper } from '../controls/inspired-components';
import { FilterPanel } from '../data/filter-panel';
import { SelfBind } from '../core/decorators';
import { DataList } from '../data/data-list';
import { i18n } from '../core/shared-vars';
import * as printerIcon from '../../../icons/printer.svg';

interface ReportViewBoxProps {

};
interface ReportViewBoxState { formData: any; validated: boolean; }
export class ReportViewBox extends OrganicBox<any, any, any, ReportViewBoxState> {

    refs: {
        filterPanel: FilterPanel;
        datalist: DataList;
    }
    @SelfBind()
    handleApplyClick() {
        const { datalist } = this.refs;

        return datalist.reload();
    }
    handleLoadRequestParams(params: OrganicUi.IAdvancedQueryFilters) {
        const filterPanel = this.querySelectorAll<FilterPanel>('.filter-panel')[0];
        if (filterPanel)
            params.filterModel = filterPanel.getFilterItems().filter(filterItem => !!filterItem.value);
        return params;
    }
    isDataListTargeted(child: React.ClassicElement<any>) {
        return child && child.type && child.type['isDataList'] && !child.props.loader;
    }
    prepareDataList(dataListElement) {
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
        return (<section ref="root">

            <CriticalContent permissionValue={p.options && p.options.permissionKey} permissionKey="report-permission" >
                {children.filter(child => !this.isDataListTargeted(child))}
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
            <span style={{minWidth:'2100p'}}></span>

            <div style={{ flex: '1' }}></div>

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
import { AdvButton } from '../core/ui-elements';
import { ListViewBox } from './list-view-box';
Object.assign(reinvent.templates, { 'report-view': ReportViewBox });