/// <reference path="../../platform.d.ts" />  
/// <reference path="../../core.d.ts" />
/// <reference path="entities.d.ts" />
/// <reference path="api.d.ts" />

import { ListViewBox, SingleViewBox } from "../../lib/platform/boxes";


const { Field, ObjectField } = Core.Data;
const { Table } = Core.Components;
const { DataList, GridColumn, DataForm, DataPanel, DataListPanel } = Core.UiKit;
const { DetailsList, SelectionMode, TextField } = FabricUI;
const { TemplateForCRUD } = Platform;
const { i18n, remoteApi } = Core;
const api = (remoteApi as any) as CustomerAPI;
const actions: IActionsForCRUD<CustomerDTO> = {
    handleCreate: dto => api.createCustomer(dto),
    handleRead: id => api.findCustomerById(id),
    handleUpdate: (id, dto) => api.updateCustomerById(id, dto),
    handleDelete: id => api.deleteCustomerById(id),
    handleLoadData: loadParams => api.readCustomerList(loadParams),

}
interface State {
    formData: CustomerDTO;
    id: any;
}
const customerListView = (s: State) => (ListViewBox.prepareState(s),
    <ListViewBox actions={actions}>
        <DataList template="listView" loader={this.handleLoadData}   >
            <GridColumn name="code" accessor="customerCode" locked={true} />
            <GridColumn name="name" accessor="customerName" resizable={true} />
            <GridColumn name="phone" accessor="phone" resizable={true} />
        </DataList>
    </ListViewBox>);

const customerSingleView = (s: State) => {
    SingleViewBox.prepareState(s);
    const { formData } = s;
    return <SingleViewBox actions={actions} formData={s.formData} id={s.id}  >
        <DataForm onGet={key => s.formData[key]} onSet={(key, value) => s.formData[key] = value}   >
            <DataPanel header="primary-fields" primary >
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
            <DataListPanel header="personal-list" items={formData.personals}  
                selectionMode={SelectionMode.single}
            >
                <Field accessor="role" label="Role" >
                    <TextField type="text" />
                </Field>
                <Field accessor="fullname" label="FullName" >
                    <TextField type="text" />
                </Field>
                <Field accessor="phone" label="Phone" >
                    <TextField type="text" />
                </Field>
                <Field accessor="comment" label="Comment" >
                    <TextField type="text" />
                </Field>
            </DataListPanel>
            <DataListPanel header="license-list" items={formData.licenses} columns={[
                { key: "computerId", name: 'ComputerId', fieldName: "role", minWidth: 100 },
                { key: "licenseDate", name: 'LicenseDate', fieldName: "licenseDate", minWidth: 200 },
                { key: "licenseCode", name: 'LicenseCode', fieldName: "licenseCode", minWidth: 200 },
                { key: "comment", name: 'Comment', fieldName: "comment", minWidth: 200 },
            ]}
                selectionMode={SelectionMode.single}
            >
                <Field accessor="role"   >
                    <TextField type="text" />
                </Field>
                <Field accessor="fullname"   >
                    <TextField type="text" />
                </Field>
                <Field accessor="phone"  >
                    <TextField type="text" />
                </Field>
                <Field accessor="comment"   >
                    <TextField type="text" />
                </Field>
            </DataListPanel>
            <DataPanel header="payment-information">
                <Field label={"payment-date"}   >
                    <TextField type="text" />
                </Field>
                <Field label={i18n("payment-completed")}  >
                    <TextField type="text" />
                </Field>
            </DataPanel>
        </DataForm>
    </SingleViewBox >
}
Core.setFunctionalView('/customer', customerListView);
Core.setFunctionalView('/customer/:id', customerSingleView);

Platform.listViews.set('customers', '/view/customer');
Platform.listViews.set('goals', '/view/goal');
