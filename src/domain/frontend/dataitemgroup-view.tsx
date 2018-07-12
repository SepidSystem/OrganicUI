/// <reference path="../../dts/globals.d.ts" />
/// <reference path="entities.d.ts" />
/// <reference path="api.d.ts" />


import { Field, SingleViewBox, ListViewBox, IOptionsForCRUD, StatelessSingleView, StatelessListView } from '@organic-ui';
import { routeTable, DataList, i18n, DataPanel,IActionsForCRUD,   TextField } from '@organic-ui';
import { AppEntities } from './entities';
import { DeviceAPI } from './api';

//OrganicUI.routeTable.set('/view/customer/:id', CustomerView, { mode: 'single' });
const api = OrganicUI.remoteApi as DeviceAPI;
const actions: IActionsForCRUD<AppEntities.DeviceDTO> = {
    create: dto => api.createDevice(dto),
    read: id => api.findDeviceById(id), readList: params => api.readDeviceList(params),
    update: (id, dto) => api.updateDeviceById(id, dto),
    deleteList: ids => api.deleteDeviceById(ids)
};
const options: IOptionsForCRUD = {
    routeForSingleView: '/view/admin/data-item-group/:id',
    routeForListView: '/view/admin/data-item-groups',
    pluralName: 'data-item-groups', singularName: 'data-item-group', iconCode: 'fa-key'
};

const singleView: StatelessSingleView = params =>
    (<SingleViewBox params={params} options={options} actions={actions}  >

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
routeTable.set(options.routeForSingleView, singleView);

const listView: StatelessListView = p => (
    <ListViewBox actions={actions} options={options} params={p}>
        <DataList>
            <Field accessor="deviceName" />
            <Field accessor="customerName" />
        </DataList>
    </ListViewBox>
)
routeTable.set(options.routeForListView, listView);

