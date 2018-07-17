/// <reference path="../../dts/organic-ui.d.ts" />
/// <reference path="entities.d.ts" />
/// <reference path="api.d.ts" />

import { departmentListView } from "./department-view";
import { AccessGroupController, DoorsController, DataItemGroupsController } from "./sepid-rest-api";
import { DeviceEntranceModes, DeviceMatchingModes, DeviceModels } from "./zero-data-structures";
import { routeTable, BaseComponent, SingleViewBox, ListViewBox, Field, TimeSlot, ComboBox, DataList, IOptionsForCRUD, StatelessListView, ITimeSlotRange, i18n, TextField, Utils, DataListPanel } from "@organic-ui";
import { AppEntities } from "./entities";
import { DataLookup } from "@organic-ui";
import { listView as scheduleListView } from './schedules-view';
import { listView as usersListView } from './user-view';

const options: IOptionsForCRUD =
{
    routeForSingleView: '/view/admin/access-group/:id',
    routeForListView: '/view/admin/access-groups',
    pluralName: 'access-groups', singularName: "access-group", iconCode: 'fa-alarm-clock'
};



interface IState {
    dayCount: number;

}
class SingleView extends BaseComponent<any, IState>{

    render() {
        return (<SingleViewBox ref="singleViewBox" params={this.props as any} actions={AccessGroupController} options={options}  >
            <div className="row">
                <div className="col-sm-6">
                    <Field accessor="name" required />
                </div>

                <div className="col-sm-6">
                    <Field accessor="description" />
                </div>
                <div className="col-sm-12">
                    <Field accessor="dataItemGroups" >
                        <DataLookup source={dataItemGroupListView} multiple />
                    </Field>
                </div>
                <DataListPanel accessor="details" className="col-sm-12" header="details" >
                    <Field accessor="scheduleId">
                        <DataLookup source={scheduleListView} />
                    </Field>
                    <Field accessor="doorId">
                        <DataLookup source={doorsListView} />
                    </Field>
                </DataListPanel>
            </div>


        </SingleViewBox>);
    }
}
routeTable.set(options.routeForSingleView, SingleView);

const listView: StatelessListView = p => (
    <ListViewBox actions={AccessGroupController} options={options} params={p}>
        <DataList>
            <Field accessor="name" />
            <Field accessor="description" />
        </DataList>
    </ListViewBox>
)
const doorsListView: StatelessListView = p => (
    <ListViewBox actions={DoorsController} options={options} params={p}>
        <DataList>
            <Field accessor="name" />
        </DataList>
    </ListViewBox>
)
const dataItemGroupListView: StatelessListView = p => (
    <ListViewBox actions={DataItemGroupsController} options={options} params={p}>
        <DataList>
            <Field accessor="name" />
        </DataList>
    </ListViewBox>
)

routeTable.set(options.routeForListView, listView);
