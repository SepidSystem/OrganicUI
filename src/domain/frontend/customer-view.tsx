/// <reference path="../../organicUI.d.ts" />
/// <reference path="entities.d.ts" />
/// <reference path="api.d.ts" />

namespace LicApp.Frontend.Customer {
    const { Field, ObjectField, SingleViewBox, ListViewBox } = OrganicUI;
    const { routeTable, DataList, GridColumn, DataForm, DataPanel, DataListPanel } = OrganicUI;
    const { DetailsList, SelectionMode, TextField } = FabricUI;

    const { i18n } = OrganicUI;

    //OrganicUI.routeTable.set('/view/customer/:id', CustomerView, { mode: 'single' });
    const api = OrganicUI.remoteApi as CustomerAPI;
    const actions: IActionsForCRUD<CustomerDTO> = {
        handleCreate: dto => api.createCustomer(dto),
        handleRead: id => api.findCustomerById(id), handleLoadData: params => api.readCustomerList(params),
        handleUpdate: (id, dto) => api.updateCustomerById(id, dto),
        handleDelete: id => api.deleteCustomerById(id)
    };
    const options: IOptionsForCRUD = {
        routeForSingleView: '/view/customer/:id',
        routeForListView: '/view/customers',
        pluralName: 'users', singularName: 'user', iconCode: 'fa-user-circle',
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
            <DataListPanel formMode="callout" singularName="license" pluralName="licenses" accessor="licenses" selectionMode={SelectionMode.single}
            >
                <Field accessor="computerId" required >
                    <TextField type="text" />
                </Field>
                <Field accessor="licenseDate"  >
                    <TextField type="text" />
                </Field>
                <Field accessor="licenseCode" >
                    <TextField type="text" />
                </Field>
                <Field accessor="comment"  >
                    <TextField type="text" />
                </Field>
            </DataListPanel>
            <DataListPanel singularName="contact" pluralName="contacts" accessor="contacts" formMode="callout" selectionMode={SelectionMode.single} >
                <Field accessor="role"   >
                    <TextField type="text" />
                </Field>
                <Field accessor="fullName"   >
                    <TextField type="text" />
                </Field>
                <Field accessor="phone"   >
                    <TextField type="text" />
                </Field>
                <Field accessor="comment"  >
                    <TextField type="text" />
                </Field>
            </DataListPanel>

            <DataPanel header="payment-information">
                <Field accessor="paymentDate"    >
                    <TextField type="text" />
                </Field>
                <Field accessor="paymentStatus"    >
                    <TextField type="text" />
                </Field>
            </DataPanel>
        </SingleViewBox>);
    //routeTable.set(options.routeForSingleView, singleView);

    const listView: StatelessListView = p => (
        <ListViewBox actions={actions} options={options} params={p}>
            <DataList>
                <GridColumn accessor="customerCode" />
                <GridColumn accessor="customerName" />
            </DataList>
        </ListViewBox>
    )
    //routeTable.set(options.routeForListView, listView);

}