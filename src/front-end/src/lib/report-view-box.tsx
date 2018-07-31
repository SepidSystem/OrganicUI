/// <reference path="../dts/globals.d.ts" />


import OrganicBox from './organic-box';
import { Paper } from './inspired-components';
import { FilterPanel } from './filter-panel';

import { DataList } from './data-list';
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
    renderContent(p = this.props) {
        const children = React.Children.toArray(this.props.children) as React.ClassicElement<any>[];
        const handleApplyClick = this.handleApplyClick.bind(this);
        let filterPanelElement = children.filter(child => child.type == FilterPanel)[0];
        filterPanelElement = filterPanelElement && React.cloneElement(filterPanelElement,
            { onApplyClick: handleApplyClick, ref: "filterPanel" } as Partial<OrganicUi.IFilterPanelProps>);
        let dataListElement = children.filter(child => child.type == DataList)[0];
        dataListElement = dataListElement && React.cloneElement(dataListElement,
            { loader: this.actions.read, height: 200, ref: "datalist", startWithEmptyList: true } as Partial<OrganicUi.IDataListProps>);

        return <section>
            <h1 className="title is-2">Report</h1>
            {filterPanelElement} <br />
            <Paper className="main-content">

                {dataListElement}
                <br /><br /> </Paper>
        </section>

    }

} 