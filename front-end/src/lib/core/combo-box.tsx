import { Select, MenuItem } from "../controls/inspired-components";
import { i18n } from "../core/shared-vars";
import { Field, FilterItem } from "../data/field";
import { BaseComponent } from "../core/base-component";
import { OutlinedInput } from "@material-ui/core";

interface ComboBoxProps {
    value?: any;
    onChange?: any;
    items: { Id, Name }[];
    placeholder?: string;
}
export class ComboBox extends BaseComponent<ComboBoxProps, any> {
    refs: {
        comboBox: any;
    }
    assignItems() {

    }
    constructor(p) {
        super(p);
        this.assignItems();
    }
    render() {
        const p = this.props;
        return (

            <Select placeholder={p.placeholder}
                input={<OutlinedInput labelWidth={0} />}
                MenuProps={{
                    className: "zIndexOneMillon",
                    getContentAnchorEl: null,
                    anchorOrigin: {
                        vertical: "bottom",
                        horizontal: "left",
                    }

                }} value={p.value} ref="comboBox" onChange={p.onChange} >

                {p.items.map(item => <MenuItem key={item.Id} value={item.Id}>{i18n(item.Name)}</MenuItem>)}
            </Select >);
    }
    focus() {
        const { comboBox } = this.refs;
        comboBox && comboBox.focus();
    }
    static textReader(field: Field, props: ComboBoxProps, id) {
        const selectedItems = props.items.filter(ite => ite.Id == id);
        return selectedItems[0] && i18n(selectedItems[0].Name);
    }
    static passFilterItem(filterItem:FilterItem){
        return Object.assign(filterItem || {}, { fieldType: 'enum' });
    }
}

ComboBox['filterOperators'] = ['eq', 'neq'];