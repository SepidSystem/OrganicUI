import { BaseComponent } from "./base-component";
import { DataForm } from "./data-form";
import { i18n } from './shared-vars';
interface IFilterPanelProps {
    dataForm?: any;

}
interface IFilterPanelState {
    selectedTab?: number;

}
export class FilterPanel extends BaseComponent<IFilterPanelProps, IFilterPanelState>{
    dataForm: any;
    constructor(p) {
        super(p);
        this.dataForm = this.props.dataForm || {};
    }
    render() {
        const s = this.state;
        return <MaterialUI.Paper className="filter-panel"  >
            {undefined && <MaterialUI.Tabs indicatorColor="primary"
                textColor="primary" value={s.selectedTab || 0} onChange={(event, selectedTab) => this.repatch({ selectedTab })} >
                <MaterialUI.Tab

                    label="Tab 1"
                />
                <MaterialUI.Tab

                    label="Tab 2"
                />
                <MaterialUI.Tab

                    label="Tab 3"
                />
            </MaterialUI.Tabs>}
            <DataForm className="medium-fields" data={this.dataForm} onFieldRead={key => this.dataForm[key]} onFieldWrite={(key, value) => {
                this.dataForm[key] = value
            }
            } >
                {this.props.children}
            </DataForm>
            <footer>
                <MaterialUI.Button variant="raised" color="primary">{i18n('apply')}</MaterialUI.Button>
                <MaterialUI.Button>{i18n('clear')}</MaterialUI.Button>

            </footer>
        </MaterialUI.Paper>
    }
}             