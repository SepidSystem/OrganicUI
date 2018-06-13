/// <reference path="../../organicUI.d.ts" />
/// <reference path="entities.d.ts" />
/// <reference path="api.d.ts" />

import { SingleViewBox } from "../../organicUI";

namespace LicApp.Frontend.Employee {
    const { Field, ObjectField, SingleViewBox, ListViewBox } = OrganicUI;
    const { routeTable, DataList, GridColumn, DataForm, DataPanel, DataListPanel } = OrganicUI;
    const { DetailsList, SelectionMode, TextField } = FabricUI;

    const { i18n } = OrganicUI;

    //OrganicUI.routeTable.set('/view/customer/:id', CustomerView, { mode: 'single' });
    const api = OrganicUI.remoteApi as EmployeeAPI;
    const actions: IActionsForCRUD<EmployeeDTO> = {
        handleCreate: dto => api.createEmployee(dto),
        handleRead: id => api.findEmployeeById(id), handleLoadData: params => api.readEmployeeList(params),
        handleUpdate: (id, dto) => api.updateEmployeeById(id, dto),
        handleDelete: id => api.deleteEmployeeById(id)
    };  
    const options: IOptionsForCRUD = {
        routeForSingleView: '/view/admin/employee/:id',
        routeForListView: '/view/admin/employees',
        pluralName: "employees", singularName: "employee", iconCode: 'fa-user'
    };
    const singleView: StatelessSingleView = params =>
        (<SingleViewBox params={params} actions={actions} options={options} >

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

            <DataPanel header="payment-information" className="medium-fields">
                <Field accessor="paymentDate"    >
                    <TextField type="text" />
                </Field>
                <Field accessor="paymentStatus"    >
                    <TextField type="text" />
                </Field>
            </DataPanel>
        </SingleViewBox>);
    routeTable.set(options.routeForSingleView, singleView);

    const listView: StatelessListView = p => (
        <ListViewBox actions={actions} options={options} params={p}>
            <DataList>
                <GridColumn accessor="id" />
                <GridColumn accessor="customerName" />
            </DataList>
        </ListViewBox>
    )
    routeTable.set(options.routeForListView, listView);

}