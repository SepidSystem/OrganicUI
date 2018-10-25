/// <reference path="../../dts/globals.d.ts" />
import { i18n } from '../core/shared-vars';
import { createElement } from 'react';
export function DataTable(p: OrganicUi.DataTableProps) {
    return <div className="data-list-wrapper">
        <table style={{ width: "100%", tableLayout: 'fixed' }} className="tableBodyScroll" dir="rtl">
            <thead>
                <tr className="ms-DetailsHeader">
                    {
                        p.captions.map((text, idx) => (
                            <th style={{ textAlign: "right", ...(p.columnsRenders[idx].tableCellStyle || {}) }}  >
                                <div className="ms-DetailsHeader-cell">
                                    {i18n(text)}
                                </div>
                            </th>
                        ))
                    }
                </tr>
            </thead>
            <tbody style={{maxHeight:p.height}} >
                {p.data.map(row => (
                    <tr className="ms-List-cell ">
                        {p.columnsRenders.map(
                            columnComponent => (<td style={{ textAlign: "right", ...(columnComponent.tableCellStyle || {}) }} {...(columnComponent.tableCellProps || {})}  >{createElement(columnComponent, row)}</td>)
                        )}

                    </tr>
                ))}
            </tbody>
        </table>
    </div>
}