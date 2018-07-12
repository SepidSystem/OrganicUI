/// <reference path="../../dts/globals.d.ts" />
/// <reference path="entities.d.ts" />
/// <reference path="api.d.ts" />


import { Field, TextField, SingleViewBox, ListViewBox, i18n, IOptionsForCRUD, StatelessSingleView, StatelessListView } from "@organic-ui";
import { routeTable, DataList, DataPanel } from "@organic-ui";
import { UserGroupsController } from "./sepid-rest-api";

const options: IOptionsForCRUD = {
    routeForSingleView: '/view/admin/usergroup/:id',
    routeForListView: '/view/admin/usergroup/:id',
    pluralName: 'user-groups', singularName: 'user-group', iconCode: 'fa-users'
};
const singleView: StatelessSingleView = params =>
    (<SingleViewBox params={params} actions={UserGroupsController} options={options} >

        <DataPanel header={i18n("primary-fields")} primary className="medium-fields" >
            <Field accessor="customerCode" required>
                <TextField type="text" />
            </Field>
            <Field accessor="customerName" required >
                <TextField type="text" />
            </Field>
            <Field accessor="phone" required>
                <TextField type="text" />
            </Field>
            <Field accessor="address" required>
                <TextField type="text" />
            </Field>
        </DataPanel>
        <DataPanel header="payment-information" className="medium-fields">
            <Field accessor="paymentDate"    >
                <TextField type="text" />
            </Field>
            <Field accessor="paymentStatus"    >
                <TextField type="text" />
            </Field>
        </DataPanel>

        <DataPanel header="payment-information">
            <Field accessor="paymentDate"    >
                <TextField type="text" />
            </Field>
            <Field accessor="paymentStatus"    >
                <TextField type="text" />
            </Field>
        </DataPanel>
    </SingleViewBox>);
routeTable.set('/view/admin/usergroup/:id', singleView);

const listView: StatelessListView = p => (
    <ListViewBox actions={UserGroupsController} options={options} params={p}>
        <DataList>
            <Field accessor="deviceName" />
            <Field accessor="customerName" />
        </DataList>
    </ListViewBox>
)
routeTable.set('/view/admin/usergroups', listView);

