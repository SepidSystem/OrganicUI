import { DataLookup } from './data-lookup';
import { Calendar } from 'react-persian-datepicker';
import { BaseComponent } from './base-component';
import { Event } from './decorators';
import { loadPersian } from "moment-jalaali";
import *  as moment from "moment-jalaali";
import *  as _moment from "moment";
import { Moment, ISO_8601 } from "moment";
import { Utils } from './utils';
import { StatelessListView } from '@organic-ui';

const DatePickerContent: StatelessListView = (p) => {
    const v = p.getValue();
    const m = v && moment(v);
    const dataLookup = p.dataLookup as DataLookup;
    return <Calendar onSelect={(value: Moment) => {

        p.setValue(['YYYY-MM-DD', 'hh:mm:ss'].map(format => value.format(format)).join('T'));
        dataLookup.closePopup()

    }} selectedDay={m}
    />
}

export class DatePicker extends BaseComponent<any, any>{
    refs: {
        dataLookup: DataLookup;
    }

    @Event()
    handleDisplayText(value) {
        const m = value && moment(value);
         return !!m && <span>{m.isValid() && m.format('jYYYY/jMM/jDD')}</span>
    }
    render() {
        const p = this.props;
        return <DataLookup ref="dataLookup" iconCode='fa-calendar'
            onDisplayText={this.handleDisplayText} minHeightForPopup="350px"
            {...this.props} className={Utils.classNames("date-picker", p.className)}
            source={DatePickerContent} />
    }
}
loadPersian();
_moment['suppressDeprecationWarnings'] =true;