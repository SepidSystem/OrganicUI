/// <reference path="../../organicUI.d.ts" />
/// <reference path="entities.d.ts" />
/// <reference path="api.d.ts" />

namespace LicApp.Frontend.UserGroup {
    const { Field, ObjectField, SingleViewBox, ListViewBox } = OrganicUI;
    const { routeTable, DataList, GridColumn, DataForm, DataPanel, DataListPanel } = OrganicUI;
    const { DetailsList, SelectionMode, TextField } = FabricUI;

    const { i18n } = OrganicUI;

    //OrganicUI.routeTable.set('/view/customer/:id', CustomerView, { mode: 'single' });
    const api = OrganicUI.remoteApi as UserGroupAPI;
    const actions: IActionsForCRUD<UserGroupDTO> = {
        handleCreate: dto => api.createUserGroup(dto),
        handleRead: id => api.findUserGroupById(id), handleLoadData: params => api.readUserGroupList(params),
        handleUpdate: (id, dto) => api.updateUserGroupById(id, dto),
        handleDelete: id => api.deleteUserGroupById(id)
    };
    const options: IOptionsForCRUD = {
        routeForSingleView: '/view/admin/usergroup/:id',
        routeForListView: '/view/admin/usergroup/:id',
        pluralName: 'user-groups', singularName: 'user-group', iconCode: 'fa-users'
    };
    const singleView: StatelessSingleView = params =>
        (<SingleViewBox params={params} actions={actions} options={options} >

            <DataPanel header={i18n("primary-fields")} primary >
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
            <DataPanel header="payment-information">
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
        <ListViewBox actions={actions} options={options} params={p}>
            <DataList>
                <GridColumn accessor="deviceName" />
                <GridColumn accessor="customerName" />
            </DataList>
        </ListViewBox>
    )
    routeTable.set('/view/admin/usergroups', listView);

}