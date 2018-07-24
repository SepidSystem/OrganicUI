import { BaseComponent } from "./base-component";
import { DataForm } from "./data-form";
import { i18n } from './shared-vars';
import { Field, FilterItem } from "./data";
import { Utils } from "./utils";
import { IDeveloperFeatures, IFieldProps } from "@organic-ui";
import { Paper, Button } from "./inspired-components";
import { AdvButton } from "./ui-kit";

interface IFilterPanelProps {
    dataForm?: any;
    operators?: any[];
    onApplyClick: () => any;
}
interface IFilterPanelState {
    selectedTab?: number;

}


export class FilterPanel extends BaseComponent<IFilterPanelProps, IFilterPanelState> implements IDeveloperFeatures {
    devPortId: any;
    dataForm: any;
    constructor(p) {
        super(p);
        this.dataForm = this.props.dataForm || {};
        this.devPortId = Utils.accquireDevPortId();

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
    render() {
        const s = this.state;
        return <section ref="root" className="filter-panel  developer-features">

            <Paper className=""  >
                
                <DataForm className="medium-fields" data={this.dataForm} onFieldRead={key => this.dataForm[key]} onFieldWrite={(key, value) => {
                    this.dataForm[key] = value
                }
                } >
                    {React.Children.map(this.props.children, child => {
                        if (child && child['type'] == Field)
                            return React.cloneElement(child as any, { operators: this.props.operators } as IFieldProps)
                        return child;
                    })
                    }
                </DataForm>
                <footer>
                    <AdvButton variant="raised" color="secondary" onClick={this.props.onApplyClick}>{i18n('apply')}</AdvButton>
                    <Button onClick={() => (this.dataForm = {}, this.repatch({}))}>{i18n('clear')}</Button>

                </footer>
            </Paper>
        </section>
    }
}
const defaultOperators = ['like', 'eq', 'neq', 'lt', 'lte', 'gt', 'gte', 'between'].map(op => ({ Id: op, Name: i18n.get(`operator-${op}`) }))

const defaultProps = {
    operators: defaultOperators
}
Object.assign(FilterPanel, { defaultProps });