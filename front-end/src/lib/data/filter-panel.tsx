import { BaseComponent } from "../core/base-component";
import { DataForm } from "../data/data-form";
import { i18n } from '../core/shared-vars';
import { Field, FilterItem } from "../data/field";
import { Utils } from "../core/utils";
import { IDeveloperFeatures, IFieldProps } from "@organic-ui";
import { Paper, Button } from "../controls/inspired-components";
import { AdvButton } from "../core/ui-elements";
import { SelfBind } from '../core/decorators';

interface IFilterPanelState {
    selectedTab?: number;

}


export class FilterPanel extends BaseComponent<OrganicUi.IFilterPanelProps, IFilterPanelState> implements IDeveloperFeatures {
    devPortId: any;
    dataForm: any;
    children: any;

    constructor(p) {
        super(p);
        this.dataForm = this.props.dataForm || {};
        this.devPortId = Utils.accquireDevPortId();
    }
    @SelfBind()
    handleLiveApply(data) {
        const trustedData = Utils.clone(data);
        setTimeout(() => {
            Utils.equals(this.dataForm, trustedData) && this.props.onApplyClick && this.props.onApplyClick();
        }, 800);
    }
    getDevButton() {
        return Utils.renderDevButton('FilterPanel', this);
    }
    getFields() {
        return this.querySelectorAll<Field>('.field-accessor');

    }
    getFilterItems() {
        return this.getFields().map(fld => Field.prototype.getFilterItem.apply(fld));
    }
    renderContent() {
        const { liveMode } = this.props;
        return <section ref="root" className="filter-panel  developer-features">

            <Paper className=""  >

                <DataForm className="medium-fields" data={this.dataForm} onChange={liveMode && this.handleLiveApply.bind(this)}>
                    {React.Children.map(this.props.children, child => {
                        const { props } = child as any;
                        if (child && child['type'] == Field)
                            return React.cloneElement(child as any, { renderMode: 'filterPanel', showOpeartors: true, operators: props.operators || this.props.operators } as IFieldProps)
                        return child;
                    })
                    }
                    <footer style={{ minWidth: liveMode ? 100 : 230 }} >
                        <span style={{ flex: 1 }}></span>
                        {!liveMode && <AdvButton variant="raised" color="secondary" className="apply-button" onClick={this.props.onApplyClick}>{i18n('apply')}</AdvButton>}
                        <AdvButton onClick={this.handleClear.bind(this)}>{i18n('clear-filter')}</AdvButton>
                    </footer>
                </DataForm>

            </Paper>
        </section >
    }
    handleClear() {
        for (const key of Object.keys(this.dataForm))
            delete this.dataForm[key];
        this.children = null;
        this.querySelectorAll<Field>('.field-accessor').forEach(fld => fld.clear());
        this.repatch({});
    }
}

