/// <reference path="../dts/globals.d.ts" />

import { BaseComponent } from './base-component';
import {  icon, i18n } from './shared-vars';
import { Utils } from './utils';
 import { Field } from './data';
import { listViews } from './shared-vars';
import { ReactElement, isValidElement } from 'react';
 
import { DataForm } from './data-form';
import { Spinner } from './spinner';
import { AdvButton, Placeholder } from './ui-kit';
 
import OrganicBox from './organic-box'; 
import { Paper } from './inspired-components';
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
            <Paper className="main-content">
                <br /><br /><br /><br /> </Paper>
        </section>

    }

} 