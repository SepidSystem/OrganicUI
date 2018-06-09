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
    const api = OrganicUI.remoteApi as DeviceAPI;
    const actions: IActionsForCRUD<DeviceDTO> = {
        handleCreate: dto => api.createDevice(dto),
        handleRead: id => api.findDeviceById(id), handleLoadData: params => api.readDeviceList(params),
        handleUpdate: (id, dto) => api.updateDeviceById(id, dto),
        handleDelete: id => api.deleteDeviceById(id)
    };
    const options: IOptionsForCRUD = {
        routeForSingleView: '/view/admin/employee/:id',
        routeForListView: '/view/admin/employee/:id',
        pluralName: "users", singularName: "user", iconCode: 'fa-user'
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
    routeTable.set('/view/admin/employee/:id', singleView);

    const listView: StatelessListView = p => (
        <ListViewBox actions={actions} options={options} params={p}>
            <DataList>
                <GridColumn accessor="deviceName" />
                <GridColumn accessor="customerName" />
            </DataList>
        </ListViewBox>
    )
    routeTable.set('/view/admin/employees', listView);

}