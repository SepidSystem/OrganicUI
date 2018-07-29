import { Select, MenuItem } from "./inspired-components";

import { i18n } from "./shared-vars";
import { Field } from "./data";
interface ComboBoxProps {
    value?: any;
    onChange?: any;
    items: { Id, Name }[];
    placeholder?:string;
}
export const ComboBox = (p: ComboBoxProps) => (
    <Select placeholder={p.placeholder} MenuProps={{className:"zIndexOneMillon"}} value={p.value} onChange={p.onChange}>
        {p.items.map(item => <MenuItem key={item.Id} value={item.Id}>{i18n(item.Name)}</MenuItem>)}
    </Select>);
function textReader(field: Field, props: ComboBoxProps, id) {
    const selectedItems = props.items.filter(ite => ite.Id == id);
    return selectedItems[0] && selectedItems[0].Name;
}
Object.assign(ComboBox, { textReader });