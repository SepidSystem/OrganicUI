import { Field } from "./field";
import { changeCase, Utils } from "../core/utils";
import { IFieldProps } from "@organic-ui";
const valueAsText = s => s && s.toString();
export function CompactDataView(p: OrganicUi.ICompactDataViewProps) {
    const children = React.Children.toArray(p.children) as any[];
    const textReaders = children.filter(col => col && (col.type && col.type.isField))
        .map(fld => ({
            reader: Field.prototype.getTextReader.apply(fld) || valueAsText,
            props: fld.props as IFieldProps,
            fieldName: Field.getAccessorName(fld.props.accessor)
        }));
 
    return <section className="compact-data-view">
        {textReaders.map(({ props, reader, fieldName }) => (!!p.data[fieldName] && <span data-fieldName={fieldName} className="field-value">
            {!!props.iconName && Utils.showIcon(props.iconName)}
            <label key="label">{Field.getLabelText(props.accessor, props.label)}</label>
            <span key="key" className="value">{reader(p.data[fieldName], p.data)}</span>
        </span>))}
    </section>
}