/// <reference path="../../organicUI.d.ts" />
/// <reference path="entities.d.ts" />
/// <reference path="api.d.ts" />

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
    const singleView = dataProps =>
        (<SingleViewBox dataProps={dataProps} actions={actions} singularName="device" >

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
    routeTable.set('/view/admin/user/:id', singleView);

    const listView = () => (
        <ListViewBox actions={actions}>
            <DataList>
                <GridColumn accessor="deviceName" />
                <GridColumn accessor="customerName" />
            </DataList>
        </ListViewBox>
    )
    routeTable.set('/view/admin/users', listView);

}