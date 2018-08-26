import { DataLookup } from './data-lookup';
import { Calendar } from 'react-persian-datepicker';
import { loadPersian } from "moment-jalaali";
import *  as moment from "moment-jalaali";
import *  as _moment from "moment";
import { Moment } from "moment";
import { BaseComponent } from '../core/base-component';
import { Utils } from '../core/utils';
import { Button } from '../controls/inspired-components';
import { i18n } from '../core/shared-vars';
import * as persian  from 'react-persian-datepicker/lib/utils/persian';
class DatePickerContent extends BaseComponent<any, any> {
    handleToday() {
        const value = moment();
        this.props.setValue(['YYYY-MM-DD', 'hh:mm:ss'].map(format => value.format(format)).join('T'));
    }
    render() {
        const p = this.props;
        const v = p.getValue && p.getValue();
        const m = v && moment(v);
        const dataLookup = p.dataLookup as DataLookup;
        return <div className="date-picker-content"  > <Calendar onSelect={(value: Moment) => {

            p.setValue(['YYYY-MM-DD', 'hh:mm:ss'].map(format => value.format(format)).join('T'));
            dataLookup.closePopup()

        }} selectedDay={m}
        />
            <div style={{ display: 'flex', justifyContent: 'center', justifyItems: 'center', padding: '5px 0' }}>
                <Button variant="raised" style={{ padding: '2px 30px' }} color="primary" >{i18n('today')}</Button>
            </div>
        </div >
    }
    static dataLookupActions = {};
    static dataLookupOptions = {};
}
export class DatePicker extends BaseComponent<any, any>{
    refs: {
        dataLookup: DataLookup;
    }

    static handleDisplayText(value) {
        const m = value && moment(value);
        return !!m && m.isValid() && <span className="shamsi-date-cell">{m.format('jYYYY/jMM/jDD')}</span>
    }
    render() {
        const p = this.props;
        return <DataLookup ref="dataLookup" iconCode='fa-calendar'
            onDisplayText={DatePicker.handleDisplayText} minHeightForPopup="350px"
            {...this.props} className={Utils.classNames("date-picker", p.className)}
            source={DatePickerContent} 
            popOverReversed={!!p.popOverReversed}
            style={p.style}
            />
    }
    static textReader(fieldProps, props, value) {
        return DatePicker.handleDisplayText(value);
    }
    static inlineMode: boolean = true;
}
DatePicker['classNameForField'] = 'date-picker-field';
loadPersian();

_moment['suppressDeprecationWarnings'] = true;
const persianNumber=x=>x;
Object.assign(persian,{persianNumber});