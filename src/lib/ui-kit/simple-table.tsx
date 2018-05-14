declare const React: any;
const { t, i18n } = Core;
const { Table } = Core.Components;
interface SimpleTableColumn {
    accessor: string;
    columnHeader: any;
}

interface SimpleTableProps {
    data: any[];
    columns: (string | SimpleTableColumn)[];
    className?: string;

}
export default class SimpleTable extends Core.BaseComponent<SimpleTableProps, never>{
    render() {
        const p = this.props;
        const cols: SimpleTableColumn[] = p.columns.map(accessor => typeof accessor == 'string' ? { accessor, columnHeader: accessor } : accessor);
        const data = this.props.data || [];
        return <Table isStriped  isBordered> 
            <thead>
                <tr>

                    {cols.map(col => (
                        <th>
                            {typeof col.columnHeader == 'string' ? i18n(col.columnHeader) : col.columnHeader}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>

                {data.map(row =>
                    <tr>  
                        {cols.map(col => ( 
                            <td>
                                { t(row, col.accessor)}
                            </td>
                       ))}
                    </tr>)}

            </tbody>
        </Table>
    }
}