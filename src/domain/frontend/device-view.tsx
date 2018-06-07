/// <reference path="../../organicUI.d.ts" />
/// <reference path="entities.d.ts" />
/// <reference path="api.d.ts" />

import OrganicBox from "../../lib/organic-box";


namespace LicApp.Frontend.Device {
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
    const crudOptions: ICRUDOptions =
        {
            routeForSingleView: '/view/admin/device/:id',
            routeForListView: '/view/admin/devices',
            pluralName: 'devices', singularName: "device", iconCode: 'fa-calculator'
        };

    const singleView = dataProps =>
        (<SingleViewBox dataProps={dataProps} actions={actions} options={crudOptions}  >

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
    routeTable.set(crudOptions.routeForSingleView, singleView);

    const listView: StatelessListView = p => (
        <ListViewBox actions={actions} options={crudOptions}>
            <DataList>
                <GridColumn accessor="deviceCode" />
                <GridColumn accessor="deviceName" />
            </DataList>
        </ListViewBox>
    )
    routeTable.set(crudOptions.routeForListView, listView);

}