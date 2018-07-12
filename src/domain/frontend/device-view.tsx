/// <reference path="../../dts/globals.d.ts" />
/// <reference path="entities.d.ts" />
/// <reference path="api.d.ts" />


import { departmentListView } from "./department-view";
import { DevicesController } from "./sepid-rest-api";
import { DeviceEntranceModes, DeviceMatchingModes, DeviceModels } from "./zero-data-structures";
import { DataLookup, Field, SingleViewBox, ListViewBox, ComboBox, IOptionsForCRUD, StatelessSingleView, StatelessListView } from "@organic-ui";
import { routeTable, DataList, DataPanel,  TextField } from "@organic-ui";
 
const { i18n } = OrganicUI;


const options: IOptionsForCRUD =
{
    routeForSingleView: '/view/admin/device/:id',
    routeForListView: '/view/admin/devices',
    pluralName: 'devices', singularName: "device", iconCode: 'fa-calculator'
};
 
const singleView: StatelessSingleView = params =>
    (<SingleViewBox params={params} actions={DevicesController} options={options}  >
        <DataPanel header={i18n("primary-fields")} primary className="medium-fields" >
            <Field accessor="code" required>
                <TextField type="text" />
            </Field>
            <Field accessor="name" required >
                <TextField type="text" />
            </Field>
            <Field accessor="serial" required>
                <TextField type="text" />
            </Field>
            <Field accessor="model" required>
                <ComboBox items={DeviceModels.Models} />
            </Field>
            <Field accessor="active"  >
                <MaterialUI.Checkbox />
            </Field>
        </DataPanel>
        <DataPanel header="settings" className="medium-fields"  >
            <Field accessor="useDhcp"    >
                <MaterialUI.Checkbox />
            </Field>
            <Field accessor="matchingMode"    >
                <ComboBox items={DeviceMatchingModes.MatchingModes} />
            </Field>
            <Field accessor="port" required  >
                <TextField type="text" />
            </Field>

            <Field accessor="ip"     >
                <MaterialUI.TextField />
            </Field>
            <Field accessor="subnet"    >
                <MaterialUI.TextField />
            </Field>
            <Field accessor="gateway"     >
                <MaterialUI.TextField />
            </Field>
        </DataPanel>

        <DataPanel header="other-settings" className="medium-fields">


            <Field accessor="entranceMode"    >
                <ComboBox items={DeviceEntranceModes.EntranceModes} />
            </Field>
            <Field accessor="syncTimeByServer"    >
                <MaterialUI.Checkbox />

            </Field>
            <Field accessor="syncLog"  >
                <MaterialUI.Checkbox />
            </Field>
            <Field accessor="syncTasks"  >
                <MaterialUI.Checkbox />
            </Field>
            <Field accessor="syncLogStartDate" />
            <Field accessor="departmentId">
                <DataLookup source={departmentListView} />
            </Field>
        </DataPanel>
    </SingleViewBox>);
routeTable.set(options.routeForSingleView, singleView);

const listView: StatelessListView = p => (
    <ListViewBox actions={DevicesController} options={options} params={p}>

        <DataList>
            <Field accessor="name" />
            <Field accessor="code" />
            <Field accessor="serial" />
            <Field accessor="model" required>
                <ComboBox items={DeviceModels.Models} />
            </Field>
        </DataList>
    </ListViewBox>
)
routeTable.set(options.routeForListView, listView);
