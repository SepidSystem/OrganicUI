/// <reference path="../../organicUI.d.ts" />
/// <reference path="entities.d.ts" />
/// <reference path="api.d.ts" />
import { roleListView } from './role-view'
namespace LicApp.Frontend.User {
    const { Field, ObjectField, SingleViewBox, ListViewBox } = OrganicUI;
    const { routeTable, DataList, GridColumn, DataForm, DataPanel, DataListPanel } = OrganicUI;
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
    const options: Ioptions = {
        routeForSingleView: '/view/admin/user/:id',
        routeForListView: '/view/admin/users',
        pluralName: 'users', singularName: 'user', iconCode: 'fa-user-circle',
    };

    const singleView: StatelessSingleView = params =>
        (<SingleViewBox params={params} actions={actions} options={options} >

            <DataPanel header={i18n("primary-fields")} primary >
                <Field accessor="userName" required>
                    <TextField type="text" />
                </Field>
                <Field accessor="displayName" required >
                    <TextField type="text" />
                </Field>
                <Field accessor="phone" required>
                    <TextField type="text" />
                </Field>
                <Field accessor="address" required>
                    <TextField type="text" />
                </Field>
            </DataPanel>

        </SingleViewBox>);
    routeTable.set(options.routeForSingleView, singleView);

    const listView: StatelessListView = p => (
        <ListViewBox actions={actions} options={options} params={p}>
            <OrganicUI.DataLookup source={roleListView} />
            <DataList>
                <GridColumn accessor="userName" />
                <GridColumn accessor="displayName" />
            </DataList>
        </ListViewBox>
    )
    routeTable.set(options.routeForListView, listView);

}