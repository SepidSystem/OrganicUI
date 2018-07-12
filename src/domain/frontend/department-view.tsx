/// <reference path="../../dts/globals.d.ts" />
/// <reference path="entities.d.ts" />
/// <reference path="api.d.ts" />

import { DepartmentsController } from "./sepid-rest-api";
import { Field, SingleViewBox, ListViewBox, IOptionsForCRUD, StatelessSingleView, StatelessListView } from '@organic-ui';
import { routeTable, DataList, DataPanel, i18n } from '@organic-ui';

const options: IOptionsForCRUD = {
    routeForSingleView: '/view/admin/department/:id',
    routeForListView: '/view/admin/departments',
    pluralName: 'departments', singularName: "department", iconCode: 'fa-sitemap'
};
const singleView: StatelessSingleView = params =>
    (<SingleViewBox params={params} actions={DepartmentsController} options={options} >

        <DataPanel header={i18n("primary-fields")} primary className="medium-fields">
            <Field accessor="id" readonly />
            <Field accessor="name" required />
            <Field accessor="description" required />
        </DataPanel>

    </SingleViewBox>);
routeTable.set(options.routeForSingleView, singleView);

export const departmentListView: StatelessListView = p => (
    <ListViewBox actions={DepartmentsController} options={options} params={p}>
        <DataList>
            {!p.forDataLookup && <Field accessor="id" />}
            <Field accessor="name" />
        </DataList>
    </ListViewBox>
)
routeTable.set(options.routeForListView, departmentListView);

