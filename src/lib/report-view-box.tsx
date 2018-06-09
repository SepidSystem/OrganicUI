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
import { DevFriendlyPort } from './developer-friendly';
import OrganicBox from './organic-box';
const { OverflowSet, SearchBox, DefaultButton, css } = FabricUI;
interface ReportViewBoxProps {

};
interface ReportViewBoxState { formData: any; validated: boolean; }
export class ReportViewBox extends OrganicBox<any,any,any, ReportViewBoxState> {
    navigateToBack(): any {

        history.back();
    }
    refs: {
        dataForm: DataForm;

    }

    render(p = this.props) {
        return <section>
            <h1 className="title is-2">Report</h1>
            <div className="main-content">
                <br /><br /><br /><br /></div>
        </section>

    }

} 