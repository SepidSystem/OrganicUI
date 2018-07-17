/// <reference path="../../dts/organic-ui.d.ts" />
/// <reference path="entities.d.ts" />
/// <reference path="api.d.ts" />

import { departmentListView } from "./department-view";
import { SchedulesController } from "./sepid-rest-api";
import { DeviceEntranceModes, DeviceMatchingModes, DeviceModels } from "./zero-data-structures";
import { routeTable, BaseComponent, SingleViewBox, ListViewBox, Field, TimeSlot, ComboBox, DataList, IOptionsForCRUD, StatelessListView, ITimeSlotRange, i18n, TextField, Utils } from "@organic-ui";
import { AppEntities } from "./entities";


const options: IOptionsForCRUD =
{
    routeForSingleView: '/view/admin/schedule/:id',
    routeForListView: '/view/admin/schedules',
    pluralName: 'schedules', singularName: "schedule", iconCode: 'fa-alarm-clock'
};
const daysInOneWeek = 7;
export enum ScheduleType {
    Weekly = "1",
    Daily = "2"

}
function beforeSave(schedule: AppEntities.ScheduleDTO) {
    if (+schedule.type == +ScheduleType.Weekly) schedule.cycle = daysInOneWeek;
    schedule.scheduleShifts = schedule.scheduleShifts.filter(ss => ss.startTime && ss.endTime);
    return schedule;
}

const validate = (schedule: AppEntities.ScheduleDTO) => Utils.validateData(schedule, {
    cycle: value => value > 90 && `schedule-cycle-outbound`

});

interface IState {
    dayCount: number;
    schedule: AppEntities.ScheduleDTO;
}
class SingleView extends BaseComponent<any, IState>{
    refs: {
        singleViewBox: SingleViewBox;
    }

    handleTypeChange(event) {
        const scheduleType = +event.target.value;
        this.state.schedule.type = scheduleType;
        this.repatch({ dayCount: (+scheduleType == +ScheduleType.Weekly) ? daysInOneWeek : this.state.schedule.cycle });
    }
    getSequenceForDays(schedule: AppEntities.ScheduleDTO): number[] {
        const { dayCount } = this.state;
        if (!schedule) return Array.from({ length: daysInOneWeek });
        let length = Utils.limitValue(Math.max((schedule && +schedule.type == +ScheduleType.Daily) ? dayCount : daysInOneWeek
            , ...(schedule.scheduleShifts || []).map(ss => ss.dayNumber)), { max: 90 });
        return Array.from({ length }).map((_, idx) => (idx + 1));
    }
    formatTime(s: string) {
        const parts = s.split(':');
        if (parts.length == 2) parts.push('00');
        return parts.join(':');
    }
    handleChangesForRanges(dayNo: number, ranges: ITimeSlotRange[]) {
        const { schedule } = this.state;

        const newRanges = ranges.map(r => ({ dayNumber: dayNo, startTime: this.formatTime(r.from), endTime: this.formatTime(r.to) }));
        if (schedule)
            schedule.scheduleShifts = schedule.scheduleShifts.filter(ss => ss.dayNumber != dayNo).concat(newRanges as any);
    }
    autoUpdateState = {
        schedule: () => this.refs.singleViewBox.getFormData(),
        dayCount: () => Promise.resolve(this.state.schedule.cycle)
    }
    render() {

        const { schedule } = this.state;
        if (schedule)
            Utils.assignDefaultValues(schedule, { scheduleShifts: [], type: +ScheduleType.Weekly, cycle: daysInOneWeek });

        const scheduleType = schedule && schedule.type;
        return (<SingleViewBox ref="singleViewBox" customActions={{ beforeSave, validate }} params={this.props as any} actions={SchedulesController} options={options}  >
            <div className="row">
                <div className="col-sm-6">
                    <Field accessor="name" required />
                </div>

                <div className="col-sm-6">
                    <Field accessor="description" />
                </div>

                <MaterialUI.RadioGroup
                    className="col-sm-4 " style={{ flexDirection: 'row', minHeight: '74px' }}
                    value={schedule && schedule.type + ""}
                    onChange={this.handleTypeChange.bind(this)}
                >
                    <MaterialUI.FormControlLabel value={ScheduleType.Weekly} control={<MaterialUI.Radio />} label={i18n("weekly")} />
                    <MaterialUI.FormControlLabel value={ScheduleType.Daily} control={<MaterialUI.Radio />} label={i18n("daily")} />

                </MaterialUI.RadioGroup>

                {(scheduleType == +ScheduleType.Daily) && <div
                    className="col-sm-4 " >
                    <Field accessor="cycle">
                        <TextField placeholder="day-count"
                            onBlur={() => this.repatch({ dayCount: +schedule.cycle })} type="number" defaultValue={daysInOneWeek} />
                    </Field>

                </div>}
                {(scheduleType == +ScheduleType.Daily) && <div className="col-sm-4 "  >
                    <Field accessor="startDate">
                        <OrganicUI.DatePicker />
                    </Field>
                </div>}

            </div>
            <div className="schedule-shifts" style={{ maxHeight: '350px', overflowY: 'scroll', overflowX: 'hidden', minHeight: '350px' }}>
                {!!schedule && this.getSequenceForDays(schedule).map((dayNo, idx) => (
                    <TimeSlot
                        key={+dayNo}
                        onChange={ranges => this.handleChangesForRanges(dayNo, ranges)}
                        prefix={dayNo}
                        ranges={schedule.scheduleShifts && schedule.scheduleShifts.filter(ss => ss.dayNumber == dayNo).map(ss => ({
                            from: ss.startTime,
                            to: ss.endTime
                        }))} />))}
            </div>

        </SingleViewBox>);
    }
}
routeTable.set(options.routeForSingleView, SingleView);

export const listView: StatelessListView = p => (
    <ListViewBox actions={SchedulesController} options={options} params={p}>
        <DataList>
            <Field accessor="name" />
            <Field accessor="cycle" />
            <Field accessor="description" />
        </DataList>
    </ListViewBox>
)
routeTable.set(options.routeForListView, listView);
