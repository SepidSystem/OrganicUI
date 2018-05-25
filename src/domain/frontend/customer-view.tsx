/// <reference path="../../platform.d.ts" />  
/// <reference path="../../organicUI.d.ts" />
/// <reference path="entities.d.ts" />
/// <reference path="api.d.ts" />

import { SingleViewBox } from "../../lib/platform/boxes";


const { Field, ObjectField } = OrganicUI.Data;
const { Table } = OrganicUI.Components;
const { DataList, GridColumn, DataForm, DataPanel, DataListPanel } = OrganicUI.UiKit;
const { DetailsList, SelectionMode, TextField } = FabricUI;
const { TemplateForCRUD } = Platform;
const { i18n } = OrganicUI;
class CustomerView extends Platform.TemplateForCRUD<{}, CustomerDTO, CustomerAPI>
    implements IViewsForCRUD<CustomerDTO> {

    constructor(props) {
        super(props);
    }
    // Handled Actions(connect view-to-API)
    handleCreate = dto => this.api.createCustomer(dto);
    handleRead = id => this.api.findCustomerById(id);
    handleUpdate = (id, dto) => this.api.updateCustomerById(id, dto);
    handleDelete = id => this.api.deleteCustomerById(id);
    handleLoadData = loadParams => this.api.readCustomerList(loadParams);

    // render SingleView
    renderListView = (s = this.state) => (
        <DataList template="listView" height={s.adjustedDataListHeight} loader={this.handleLoadData}   >
            <GridColumn name="code" accessor="customerCode" locked={true} />
            <GridColumn name="name" accessor="customerName" resizable={true} />
            <GridColumn name="phone" accessor="phone" resizable={true} />
        </DataList >);
    renderSingleView = (formData: CustomerDTO) => (formData.personals = formData.personals || [], formData.licenses = formData.licenses || [],
        <DataForm onFieldRead={key => formData[key]} onFieldWrite={(key, value) => formData[key] = value}   >

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
            <DataListPanel header="personal-list" accessor='personals' formMode="modal" selectionMode={SelectionMode.single} >
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
            <DataListPanel formMode="callout" header="license-list" accessor='licenses'
                selectionMode={SelectionMode.single}
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
        </DataForm>
    )

};

Platform.listViews.set('customers', '/view/customer');
Platform.listViews.set('goals', '/view/goal');
OrganicUI.routeTable.set('/view/customer', CustomerView, { mode: 'list' });
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
OrganicUI.routeTable.set('/view/customer/:id', singleView);