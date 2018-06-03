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
import { DevFriendlyPort } from '../organicUI';
import OrganicBox from './organic-box';
const { OverflowSet, SearchBox, DefaultButton, css } = FabricUI;
interface DashboardBoxProps {
   
};
interface DashboardBoxState { formData: any; validated: boolean; }
export class DashboardBox extends OrganicBox<DashboardBoxProps, DashboardBoxState> {
    navigateToBack(): any {

        history.back();
    }
    refs: {
        dataForm: DataForm;

    }

    render(p = this.props) {
        return <section>
            <h1 className="title is-1">{i18n('dashboard')}</h1>
            <div className="main-content">
            <br/><br/></div>
        </section>

    }

} 