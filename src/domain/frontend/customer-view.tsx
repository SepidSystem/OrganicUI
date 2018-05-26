/// <reference path="../../organicUI.d.ts" />
/// <reference path="entities.d.ts" />
/// <reference path="api.d.ts" />

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
const singleView = (p) =>
    (<SingleViewBox id={p.id} actions={{} as any} >

        <DataPanel header={i18n("primary-fields")} primary >
            <Field accessor="customerCode">
                <TextField type="text" />
            </Field>
            <Field accessor="customerName">
                <TextField type="text" />
            </Field>
            <Field accessor="phone" >
                <TextField type="text" />
            </Field>
            <Field accessor="address">
                <TextField type="text" />
            </Field>

        </DataPanel>
        <DataListPanel header="personal-list" accessor="personals" formMode="modal" selectionMode={SelectionMode.single} >
            <Field accessor="role" readonly >
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
        <DataListPanel formMode="callout" header="license-list" accessor="licenses" selectionMode={SelectionMode.single}
        >
            <Field accessor="computerId"  >
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
        <DataPanel header="payment-information">
            <Field accessor="paymentDate"    >
                <TextField type="text" />
            </Field>
            <Field accessor="paymentStatus"    >
                <TextField type="text" />
            </Field>
        </DataPanel>
    </SingleViewBox>);

routeTable.set('/view/customer/:id', singleView);

const listView = () => (
    <ListViewBox actions={actions}>
    </ListViewBox>
)
routeTable.set('/view/customer', listView);
