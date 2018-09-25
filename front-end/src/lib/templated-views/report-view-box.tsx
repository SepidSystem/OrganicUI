/// <reference path="../../dts/globals.d.ts" />


import OrganicBox from './organic-box';
import { Paper } from '../controls/inspired-components';
import { FilterPanel } from '../data/filter-panel';

import { DataList } from '../data/data-list';
import { i18n } from '../core/shared-vars';
interface ReportViewBoxProps {
    
};
interface ReportViewBoxState { formData: any; validated: boolean; }
export class ReportViewBox extends OrganicBox<any, any, any, ReportViewBoxState> {

    refs: {
        filterPanel: FilterPanel;
        datalist: DataList;
    }
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
        return React.cloneElement(dataListElement,
            {
                loader: dataListElement.props.loader || this.actions.read,
                height: 700,
                ref: "datalist",
                onLoadRequestParams: this.handleLoadRequestParams.bind(this),
                startWithEmptyList: true
            } as Partial<OrganicUi.IDataListProps>)
    }
    renderContent(p = this.props) {
        const handleApplyClick = this.handleApplyClick.bind(this);
        let children = React.Children.toArray(this.props.children) as any[];
        children = children.map(child => {
            if (child && (child.type == FilterPanel))
                return React.cloneElement(child, { onApplyClick: handleApplyClick, ref: "filterPanel" } as Partial<OrganicUi.IFilterPanelProps>);

            return child;


        });
        return (<section ref="root">
            {children.filter(child => !this.isDataListTargeted(child))}
            <br /><Paper className="main-content">
                {children.filter(this.isDataListTargeted).map(dataListElement => this.prepareDataList(dataListElement))}
                <br /><br />
            </Paper>
        </section>);

    }

}
import { reinvent } from '../reinvent/reinvent';
Object.assign(reinvent.templates, { 'report-view': ReportViewBox });