/// <reference path="../../organicUI.d.ts" />
/// <reference path="entities.d.ts" />
/// <reference path="api.d.ts" />
import { roleListView } from './role-view'
import { UserController } from "./sepid-rest-api";
namespace LicApp.Frontend.User {
    const { DataLookup } = OrganicUI;
    const { Field, ObjectField, SingleViewBox, ListViewBox } = OrganicUI;
    const { routeTable, DataList, DataForm, DataPanel, DataListPanel } = OrganicUI;
    const { DetailsList, SelectionMode, TextField } = FabricUI;

    const { i18n } = OrganicUI;

    //OrganicUI.routeTable.set('/view/customer/:id', CustomerView, { mode: 'single' });
    
    const options: IOptionsForCRUD = {
        routeForSingleView: '/view/admin/user/:id',
        routeForListView: '/view/admin/users',
        pluralName: 'users', singularName: 'user', iconCode: 'fa-user-circle'
    };

    const singleView: StatelessSingleView = params =>
        (<SingleViewBox params={params} actions={UserController} options={options}  >

            <DataPanel header={i18n("primary-fields")} primary className="half-column-fields"  >
                <Field accessor="active"    >
                    <MaterialUI.Checkbox />
                </Field>
                <Field accessor="roleIds"     >
                    <DataLookup multiple source={roleListView} />
                </Field>


                <Field accessor="username" required  >
                    <MaterialUI.TextField />
                </Field>
                <Field accessor="fullName" required  >
                    <MaterialUI.TextField />
                </Field>


                <Field accessor="password"   >
                    <MaterialUI.TextField type="password" />
                </Field>
                <Field accessor="confrimPassword"   >
                    <MaterialUI.TextField />
                </Field>


            </DataPanel>

        </SingleViewBox>);
    routeTable.set(options.routeForSingleView, singleView);

    const listView: StatelessListView = p => (
        <ListViewBox actions={UserController} options={options} params={p}>

            <DataList>
                <Field accessor="fullName" />
                <Field accessor="username" />
            </DataList>
        </ListViewBox>
    )
    routeTable.set(options.routeForListView, listView);

}