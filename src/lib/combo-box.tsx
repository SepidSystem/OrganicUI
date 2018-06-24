import Select from "@material-ui/core/Select/Select";
import MenuItem from "@material-ui/core/MenuItem/MenuItem";
import { i18n } from "./shared-vars";
import { Field } from "./data";
interface ComboBoxProps {
    value?: any;
    onChange?: any;
    items: { Id, Name }[];
}
export const ComboBox = (p: ComboBoxProps) => (
    <Select value={p.value} onChange={p.onChange}>
        {p.items.map(item => <MenuItem value={item.Id}>{(item.Name)}</MenuItem>)}
    </Select>);
function textReader(field: Field, props: ComboBoxProps, id) {
    const selectedItems = props.items.filter(ite => ite.Id == id);
    return selectedItems && selectedItems[0].Name;
}
Object.assign(ComboBox, { textReader });