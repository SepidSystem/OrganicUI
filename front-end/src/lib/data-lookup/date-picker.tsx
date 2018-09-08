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
import * as persian from 'react-persian-datepicker/lib/utils/persian';
class DatePickerContent extends BaseComponent<any, any> {
    handleToday() {
        const value = moment();
        this.props.setValue(['YYYY-MM-DD', 'hh:mm:ss'].map(format => value.format(format)).join('T'));
    }
    handleSelect(value: Moment) {
        const dataLookup = this.props.dataLookup as DataLookup;
        this.props.setValue(value && (['YYYY-MM-DD', 'hh:mm:ss'].map(format => value.format(format)).join('T')));
        dataLookup.closePopup()

    }
    render() {
        const p = this.props;
        const v = p.getValue && p.getValue();
        const m = v && moment(v);
        return <div className="date-picker-content"  > <Calendar
            key={!m ? '0' : m.toISOString()}
            onSelect={(value: Moment) => this.handleSelect(value)} selectedDay={m}
        />
            <div style={{ display: 'flex', justifyContent: 'center', justifyItems: 'center', padding: '5px 0' }}>
                <Button variant="raised" onClick={() => this.handleSelect(moment())} style={{ padding: '2px 30px', margin: '0 5px' }} color="primary" >{i18n('today')}</Button>
                <Button variant="raised" onClick={() => v && this.handleSelect((null))} style={{ padding: '2px 30px', margin: '0 5px' }} color="primary" >{i18n('clear')}</Button>
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

    static handleDisplayText(value:string) {
        
        value = value && value.toString();
        if(value && value.indexOf('T')) value=value.split('T')[0].split('-').join('/');
        const m = value && moment(value);
        let timeIdx = value && value.indexOf(':');
        let time = '';
        if (timeIdx > 0 && typeof arguments[0] == 'string') {
            while (timeIdx && value[timeIdx] != ' ') timeIdx--;
            let timeIdx2 = timeIdx + 2;
            const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', ':']
            while (timeIdx2 < value.length && digits.includes(value[timeIdx2])) timeIdx2++;
            time = value.toString().substring(timeIdx, timeIdx2);

        }
        return !!m && m.isValid() && <span className="shamsi-date-cell">
            <span style={{ float: 'left' }}>
                {m.format('jYYYY/jMM/jDD')}
            </span>
            <span style={{ float: 'right' }}>
                {time}
            </span></span>
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
const persianNumber = x => x;
Object.assign(persian, { persianNumber });
Object.assign(window, { moment });