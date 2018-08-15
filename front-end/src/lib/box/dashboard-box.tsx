/// <reference path="../../dts/globals.d.ts" />

import { i18n } from '../core/shared-vars';
import { DataForm } from '../data/data-form';
import OrganicBox from './organic-box';
 
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
          
        </section>

    }

} 