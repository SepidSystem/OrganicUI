/// <reference path="../../organicUI.d.ts" />
/// <reference path="entities.d.ts" />
/// <reference path="api.d.ts" />
import { roleListView } from './role-view'
const { DataLookup } = OrganicUI;
namespace LicApp.Frontend.User {
    const { Field, ObjectField, SingleViewBox, ListViewBox } = OrganicUI;
    const { routeTable, DataList,   DataForm, DataPanel, DataListPanel } = OrganicUI;
    const { DetailsList, SelectionMode, TextField } = FabricUI;

    const { i18n } = OrganicUI;

    //OrganicUI.routeTable.set('/view/customer/:id', CustomerView, { mode: 'single' });
    const api = OrganicUI.remoteApi as UserAPI;
    const actions: IActionsForCRUD<UserDTO> = {
        handleCreate: dto => api.createUser(dto),
        handleRead: id => api.findUserById(id), handleLoadData: params => api.readUserList(params),
        handleUpdate: (id, dto) => api.updateUserById(id, dto),
        handleDelete: id => api.deleteUserById(id)
    };
    const options: IOptionsForCRUD = {
        routeForSingleView: '/view/admin/user/:id',
        routeForListView: '/view/admin/users',
        pluralName: 'users', singularName: 'user', iconCode: 'fa-user-circle',
    };

    const singleView: StatelessSingleView = params =>
        (<SingleViewBox params={params} actions={actions} options={options}  >

            <DataPanel header={i18n("primary-fields")} primary className="half-column-fields"  >
                <Field accessor="active"    >
                    <MaterialUI.Checkbox />
                </Field>
                <Field accessor="roleIds"     >
                    <DataLookup multiple source={roleListView} />
                </Field>


                <Field accessor="userName" required  >
                    <MaterialUI.TextField />
                </Field>
                <Field accessor="userTitle" required  >
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
        <ListViewBox actions={actions} options={options} params={p}>

            <DataList>
                <Field accessor="userName" />
                <Field accessor="userTitle" />
            </DataList>
        </ListViewBox>
    )
    routeTable.set(options.routeForListView, listView);

}