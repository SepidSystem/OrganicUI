/// <reference path="../dts/globals.d.ts" />

import { BaseComponent } from './base-component';
import {   icon, i18n } from './shared-vars';
import { Utils } from './utils';

import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import { Field } from './data';
import { listViews } from './shared-vars';
import { ReactElement, isValidElement } from 'react';
 
import { DataForm } from './data-form';
import { Spinner } from './spinner';
import { AdvButton, Placeholder } from './ui-kit';
    
import OrganicBox from './organic-box';
const { OverflowSet, SearchBox, DefaultButton, css } = FabricUI;
interface DashboardBoxProps {

};
interface DashboardBoxState { formData: any; validated: boolean; }
export class DashboardBox extends OrganicBox<any, any, any, DashboardBoxState> {
    navigateToBack(): any {

        history.back();
    }
    refs: {
        dataForm: DataForm;

    }

    render(p = this.props) {
        return <section>
            <div className="title is-5">{i18n('dashboard')}</div>
            <MaterialUI.ExpansionPanel>
                <MaterialUI.ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                    <MaterialUI.Typography  >Expansion Panel 1</MaterialUI.Typography>
                </MaterialUI.ExpansionPanelSummary>
                <MaterialUI.ExpansionPanelDetails>
                    <MaterialUI.Typography>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex,
                        sit amet blandit leo lobortis eget.
          </MaterialUI.Typography>
                </MaterialUI.ExpansionPanelDetails>
            </MaterialUI.ExpansionPanel>
            <MaterialUI.ExpansionPanel>
                <MaterialUI.ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                    <MaterialUI.Typography  >Expansion Panel 2</MaterialUI.Typography>
                </MaterialUI.ExpansionPanelSummary>
                <MaterialUI.ExpansionPanelDetails>
                    <MaterialUI.Typography>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex,
                        sit amet blandit leo lobortis eget.
          </MaterialUI.Typography>
                </MaterialUI.ExpansionPanelDetails>
            </MaterialUI.ExpansionPanel>
            <MaterialUI.ExpansionPanel disabled>
                <MaterialUI.ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                    <MaterialUI.Typography  >Disabled Expansion Panel</MaterialUI.Typography>
                </MaterialUI.ExpansionPanelSummary>
            </MaterialUI.ExpansionPanel>
            <br /><br />
        </section>

    }

} 