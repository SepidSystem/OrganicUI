
import { Utils } from './utils';
import { AppUtils } from './app-utils';
import { DataForm } from './data-form';
import { Field } from './data';
import { i18n } from './shared-vars';
import { BaseComponent } from './base-component';
import { ITimeSlotRange,  Callout } from '@organic-ui';

import { AdvSection } from './advanced-section';
import { TimeEdit } from './time-edit';
import { Button } from './inspired-components';
 
const hourCount = 24;
function handleEdit() {
    AppUtils.showDialog('sdfsdf');
}

const secondsInDay = 24 * 3600;
const units = [3600, 60, 1];
const getSeconds = time => Utils.sumValues(time.split(':').map((part, idx) => (+part * units[idx])));
function secondsToPrecents(time: string, suffix?): any {
    return ((getSeconds(time) / secondsInDay) * 100) + (suffix || 0);
}

function checkConflictOfRanges(ranges: ITimeSlotRange[]): [number, number] | false {
    ranges = ranges.filter(r => r.from && r.to);
    const checkTwoRange = (r1: ITimeSlotRange, r2: ITimeSlotRange) => {
        const from1 = getSeconds(r1.from);
        const to1 = getSeconds(r1.to);
        const from2 = getSeconds(r2.from);
        const to2 = getSeconds(r2.to);
        return !!([from1, to1].filter(n => (n >= from2 && n <= to2)).length);
    }
    for (let i = 0; i < ranges.length; i++) {
        for (let j = 0; j < ranges.length; j++) {
            if (i == j) continue;
            if (checkTwoRange(ranges[i], ranges[j])) return [i, j];
        }

    }
    return false;
}
function checkTimeRange(currentRange: ITimeSlotRange, nextRange: ITimeSlotRange) {
    if (!currentRange.from && !currentRange.to) return;
    if (!currentRange.from || !TimeSlot.checkTime(currentRange.from)) return 'invalid-timeslot-from';
    if (!currentRange.to || !TimeSlot.checkTime(currentRange.to)) return 'invalid-timeslot-to';

    if (getSeconds(currentRange.from) >= getSeconds(currentRange.to)) return 'invalid-timeslot-range-from-to';
    if (nextRange && nextRange.from && (getSeconds(currentRange.to) >= getSeconds(nextRange.from))) return 'invalid-timeslot-range-unsorted';


}
interface IState {
    ranges: ITimeSlotRange[];
    targetRange: HTMLElement;
    rangeData: ITimeSlotRange;
    rangeIndex: number;
    errorMessage: React.ReactNode;
}
export class TimeSlot extends BaseComponent<OrganicUi.ITimeSlotProps, IState> {
    refs: {
        root: HTMLElement;
        main: HTMLElement;
    }
    static checkTime(time: string): boolean {
        const parts = time.split(':');
        if ((parts.length < 2) || (parts.length > 3)) return false;
        const hour = +parts[0];
        if ((hour < 0) || (hour >= 24)) return false;
        const minute = +parts[1];
        if ((minute < 0) || (minute >= 60)) return false;
        const seconds = +(parts[2] || '00');
        if ((seconds < 0) || (seconds >= 60)) return false;

        return true;

    }
    handleQuickApply(): any {
        const { rangeIndex, rangeData } = this.state;
        const ranges = Utils.clone(this.state.ranges);
        ranges[rangeIndex] = rangeData;
        this.fullUpdate(ranges)
            .then(() => this.repatch({ targetRange: null }),
                errorMessage => this.repatch({ errorMessage }));
    }

    componentWillMount() {
        this.state.ranges = Utils.clone(this.props.ranges || []);
    }
    invalids: any;
    fullUpdate(ranges: ITimeSlotRange[]): Promise<boolean> {
        const conflict = checkConflictOfRanges(ranges);
        this.invalids = {};
        if (conflict) {
            const { root } = this.refs;
            if (root) {
                conflict.forEach(idx => {
                    const range = root.querySelector(`.range${idx}`);
                    (range && range.classList.add('animated', 'flash'));

                });
                setTimeout(() => Array.from(root.querySelectorAll('.animated')).forEach(ele => ele.classList.remove('animated', 'flash')), 1000);
            }
            this.invalids = { [conflict[0]]: true, [conflict[1]]: true };
            return Promise.reject(Utils.i18nFormat('time-slot-conflict',
                conflict.join(','))
            );
        }
        for (let counter = 0; counter < ranges.length; counter++) {
            const errorCode = checkTimeRange(ranges[counter], ranges[counter + 1]);

            if (errorCode) {
                this.invalids = { [counter]: true };
                return Promise.reject(Utils.i18nFormat(errorCode, counter));
            }
        }

        this.doChange(ranges);
        AppUtils.showDialog(null);
        return Promise.resolve(true);

    }
    handleEdit() {
        this.repatch({ targetRange: null });
        const ranges = Utils.clone(this.state.ranges);
        for (let i = 0; i < 5; i++) ranges[i] = ranges[i] || { from: '', to: '' };

        AppUtils.showDialog(<TimeSlotDialog onOkeyClick={ranges => this.fullUpdate(ranges).catch(errorMessage => TimeSlotDialog.Instance.setErrorMessage(errorMessage, this.invalids))} ranges={ranges} />)
    }
    doChange(ranges: ITimeSlotRange[]) {

        this.props.onChange instanceof Function && this.props.onChange(ranges);
        this.repatch({ ranges });
    }
    render() {
        const p = this.props, s = this.state;
        const { main } = this.refs;
        if (!main) setTimeout(() => this.repatch({}), 10);

        return <section className="time-slot" ref="root">
            <span className="prefix">{this.props.prefix}</span>
            <header>
                {Array.from({ length: hourCount + 1 }, (_, idx) => idx)
                    .map(hour => <span style={{ visibility: hour % 3 == 0 ? 'visible' : 'hidden' }} className={`hour hour-${hour}`}>{hour} </span>)}
            </header>
            <main ref="main">
                {Array.from({ length: hourCount + 1 }, (_, idx) => idx).map(hour => <span className="slice" />)}

            </main>
            <main className="range-wrapper">
                <div className="ranges">     {s.ranges && s.ranges.filter(r => r.from && r.to).map((range, idx) => (
                    <span className={`range range${idx}`}
                        onClick={e => this.repatch({ rangeIndex: idx, rangeData: Utils.clone(range), targetRange: e.target as HTMLElement })}
                        style={{
                            width: (secondsToPrecents(range.to) - secondsToPrecents(range.from)) + '%',
                            left: secondsToPrecents(range.from, '%')
                        }}
                        data-width={(secondsToPrecents(range.to) - secondsToPrecents(range.from))} ></span>
                ))} </div>
            </main>

            <div className="buttons" >
                <a href='#' onClick={e => (e.preventDefault(), this.handleEdit())} >
                    {Utils.showIcon("fa-edit")}
                </a>
                <a href='#' onClick={e => (
                    e.preventDefault(),
                    OrganicUI.AppUtils.confrim('Are you sure').then(
                        () => this.doChange([])
                    ))} >
                    {Utils.showIcon("fa-eraser")}
                </a>
            </div >
            {!!s.targetRange && <Callout onDismiss={() => this.repatch({ targetRange: null })} target={s.targetRange} >
                <br />
                <AdvSection className="compact" errorMessage={s.errorMessage} onCloseMessage={() => this.repatch({ errorMessage: null })}>
                    <DataForm className="data-form-row"
                        onFieldRead={key => s.rangeData[key]}
                        onFieldWrite={(key, value) => s.rangeData[key] = value}>
                        <Field accessor="from">
                            <TimeEdit />
                        </Field>
                        <Field accessor="to">
                            <TimeEdit />
                        </Field>
                        <OrganicUI.AdvButton color="primary" variant="raised"
                            onClick={() => this.handleQuickApply()} >
                            {Utils.showIcon('fa-check')}
                        </OrganicUI.AdvButton >
                        <OrganicUI.AdvButton onClick={() => (this.repatch({ targetRange: null }), null)} > {Utils.showIcon('fa-close')}   </OrganicUI.AdvButton >
                    </DataForm>
                </AdvSection>


            </Callout>}
        </section >

    }
}
interface ITimeSlotDialogProps {
    onOkeyClick: any;
    ranges: ITimeSlotRange[];
}
class TimeSlotDialog extends BaseComponent<ITimeSlotDialogProps, any>{
    refs: {
        range: HTMLElement;
    }
    componentWillMount() {
        TimeSlotDialog.Instance = this;
        this.state.ranges = Utils.clone(this.props.ranges);
    }
    setErrorMessage(errorMessage, invalids) {
        invalids = invalids || {};
        this.repatch({ errorMessage, invalids });
    }
    static Instance: TimeSlotDialog;
    renderRanges() {
        let { ranges, invalids } = this.state;
        invalids = invalids || {};
        return ranges instanceof Array && ranges.map((range, index) => (
            <DataForm key={index} className={Utils.classNames(invalids && invalids[index] && 'invalid', 'data-form-row', `range${index}`)}
                onFieldRead={key => range[key]}
                onFieldWrite={(key, value) => (range[key] = value, this.repatch({ invalids: Utils.excl(invalids, index) }, undefined, 100))}>
                <Field key="from" accessor="from">
                    <TimeEdit />
                </Field>
                <Field key="to" accessor="to">
                    <TimeEdit />
                </Field>

            </DataForm>

        ))
    }
    render() {

        return <AdvSection errorMessage={this.state.errorMessage} onCloseMessage={() => this.repatch({ errorMessage: null })} >
            <h3 className="title is-3 is-centered">{i18n('timeslot-group-edit')}</h3>
            <div className="ranges" ref="range">
                {this.renderRanges()}
            </div>
            <footer className="is-centered">
                <Button fullWidth color="primary" variant="raised" onClick={() => this.props.onOkeyClick(this.state.ranges)}  >{Utils.showIcon('fa-check')}{i18n('apply')}  </Button >

            </footer>
        </AdvSection>

    }
}