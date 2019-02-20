import { BaseComponent } from "../core/base-component";
import { DataForm } from "../data/data-form";
import { i18n } from '../core/shared-vars';
import { Field, FilterItem } from "../data/field";
import { Utils } from "../core/utils";
import { IDeveloperFeatures, IFieldProps } from "@organic-ui";
import { Paper, Button } from "../controls/inspired-components";
import { AdvButton } from "../controls/adv-button";
import { SelfBind } from '../core/decorators';

interface IState {
    selectedTab?: number;
    isClearing?: boolean;
}


export class FilterPanel extends BaseComponent<OrganicUi.IFilterPanelProps, IState> implements IDeveloperFeatures {
    devPortId: any;
    dataForm: any;
    children: any;
    static defaultProps: Partial<OrganicUi.IFilterPanelProps> = {
        customActions: {}
    }
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
    assignValuesFromQueryString(queryString) {
        const data = Utils.parseQueryString(queryString);
        const fieldDic = this.getFieldDic();
        let result=false;
        for (const key in data) {
            const [fieldName, currentOp] = key.split('_');
            const field = fieldDic[fieldName];
            if (!field) continue;
            currentOp && field.repatch({ currentOp });
            field.handleSetData({ value: data[key] } as any, null);
            result=true;
        }
        return result;
    }
    getDevButton() {
        return Utils.renderDevButton('FilterPanel', this);
    }
    getFieldDic(): ({ [key: string]: Field }) {
        return Object.assign({},
            ...this.getFields().map(fld => ({ [Field.getAccessorName(fld.props.accessor)]: fld })))
    }
    getFields() {
        return this.querySelectorAll<Field>('.field-accessor');

    }
    getFilterItems() {
        if(this.props.customModel) return this.dataForm || {};
        return this.getFields().map(fld => Field.prototype.getFilterItem.apply(fld));
    }
    renderContent() {
        const p = this.props;
        const { liveMode } = this.props;
        return <section ref="root" className={"filter-panel  developer-features " + (this.state.isClearing ? 'clearing' : '')}>

            <Paper className="filter-panel-paper"  >

                <DataForm className="medium-fields" data={this.dataForm} onChange={liveMode && this.handleLiveApply.bind(this)}>
                    {React.Children.map(this.props.children, child => {
                        const { props } = child as any;
                        if (child && child['type'] == Field)
                            return React.cloneElement(child as any, { renderMode:!this.props.customModel && 'filterPanel', showOpeartors: !this.props.customModel, operators: props.operators || this.props.operators } as IFieldProps)
                        return child;
                    })
                    }
                    <footer style={{ minWidth: '100%' }} >
                        {Utils.entries(p.customActions).map(
                            ([key, func]) =>
                                (<AdvButton variant="outlined" color="secondary" onClick={func}>{i18n(key)}</AdvButton>)
                        )}
                        <span style={{ flex: 1 }}></span>
                        <AdvButton variant="raised" color="secondary" className="apply-button" onClick={this.props.onApplyClick}>{i18n('apply')}</AdvButton>
                        <AdvButton onClick={this.handleClear.bind(this)}>{i18n('clear-filter')}</AdvButton>


                    </footer>
                </DataForm>

            </Paper>
        </section >
    }
    async handleClear() {
        for (const key of Object.keys(this.dataForm))
            delete this.dataForm[key];
        this.children = null;
        this.querySelectorAll<Field>('.field-accessor').forEach(fld => fld.clear());

        await this.repatch({ isClearing: true });
        await this.props.onApplyClick && this.props.onApplyClick();
        await this.repatch({ isClearing: false }, null, 300);
    }
}

