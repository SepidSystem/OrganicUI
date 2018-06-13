/// <reference path="../../organicUI.d.ts" />
/// <reference path="entities.d.ts" />
/// <reference path="api.d.ts" />

 
const { DataLookup, FilterPanel } = OrganicUI;
import { departmentListView } from "./department-view";




const { Field, ObjectField, SingleViewBox, ListViewBox } = OrganicUI;
const { routeTable, DataList, GridColumn, DataForm, DataPanel, DataListPanel } = OrganicUI;
const { TextField } = MaterialUI;

const { i18n } = OrganicUI;

//OrganicUI.routeTable.set('/view/customer/:id', CustomerView, { mode: 'single' });
const api = OrganicUI.remoteApi as DeviceAPI;
const actions: IActionsForCRUD<DeviceDTO> = {
    handleCreate: dto => api.createDevice(dto),
    handleRead: id => api.findDeviceById(id), handleLoadData: params => api.readDeviceList(params),
    handleUpdate: (id, dto) => api.updateDeviceById(id, dto),
    handleDelete: id => api.deleteDeviceById(id)
};
const options: IOptionsForCRUD =
    {
        routeForSingleView: '/view/admin/device/:id',
        routeForListView: '/view/admin/devices',
        pluralName: 'devices', singularName: "device", iconCode: 'fa-calculator'
    };

const singleView: StatelessSingleView = params =>
    (<SingleViewBox params={params} actions={actions} options={options}  >

        <DataPanel header={i18n("primary-fields")} primary className="medium-fields" >
            <Field accessor="deviceCode" required>
                <TextField type="text" />
            </Field>
            <Field accessor="deviceName" required >
                <TextField type="text" />
            </Field>
            <Field accessor="deviceSerial" required>
                <TextField type="text" />
            </Field>
            <Field accessor="deviceType" required>
                <MaterialUI.Select />
            </Field>
            <Field accessor="active"  >
                <MaterialUI.Checkbox />
            </Field>
        </DataPanel>
        <DataPanel header="settings" className="medium-fields"  >
            <Field accessor="port" required  >
                <TextField type="text" />
            </Field>
            <Field accessor="contectionType" required  >
                <MaterialUI.Select />
            </Field>
            <Field accessor="IP" required   >
                <MaterialUI.TextField />
            </Field>
            <Field accessor="Subnet" required  >
                <MaterialUI.TextField />
            </Field>
            <Field accessor="Gateway" required   >
                <MaterialUI.TextField />
            </Field>
        </DataPanel>

        <DataPanel header="other-settings" className="medium-fields">
            <Field accessor="paymentDate"    >
                <MaterialUI.Select />
            </Field>
            <Field accessor="departmentId"    >
                <DataLookup source={departmentListView} />
            </Field>
            <Field accessor="adjust-date-time"  >
                <MaterialUI.Checkbox />
            </Field>
        </DataPanel>
    </SingleViewBox>);
routeTable.set(options.routeForSingleView, singleView);
 
const listView: StatelessListView = p => (
    <ListViewBox actions={actions} options={options} params={p}>
     
        <DataList> 
            <GridColumn accessor="deviceName" />
            <GridColumn accessor="deviceCode" />
            <GridColumn accessor="deviceSerial" />
            <GridColumn accessor="deviceType" />

        </DataList>
    </ListViewBox>
)
routeTable.set(options.routeForListView, listView);
