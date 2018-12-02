import { DataLookup } from './data-lookup';
import { Calendar } from 'react-persian-datepicker';
import { loadPersian } from "moment-jalaali";
import *  as moment from "moment-jalaali";
import *  as _moment from "moment";
import { Moment } from "moment";
import { BaseComponent } from '../core/base-component';
import { Utils } from '../core/utils';
import { Button, TextField } from '../controls/inspired-components';
import { i18n } from '../core/shared-vars';
import * as persian from 'react-persian-datepicker/lib/utils/persian';
import { FilterItem } from '../data/field';
import { SelfBind } from '../core/decorators';
class DatePickerContent extends BaseComponent<any, any> {
    @SelfBind()
    handleToday() {
        const value = moment();
        this.props.setValue(['YYYY-MM-DD', 'hh:mm:ss'].map(format => value.format(format)).join('T'));
    }
    @SelfBind()
    handleSelect(value: Moment) {
        const dataLookup = this.props.dataLookup as DataLookup;
        const freshValue = value && (['YYYY-MM-DD', 'hh:mm:ss'].map(format => value.format(format)).join('T'));
        this.props.setValue(freshValue);
        dataLookup.closePopup();
    }
    renderContent() {
        const p = this.props;
        const v = p.getValue && p.getValue();
        const selectedDay = (v && moment(v)) || undefined;
        return <div className="date-picker-content"  > <Calendar
            key={!selectedDay ? '0' : selectedDay.toISOString()}
            onSelect={(value: Moment) => this.handleSelect(value)} {...(selectedDay ? { selectedDay } : {})}
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
export class DatePicker extends BaseComponent<OrganicUi.DatePickerProps, any>{
    refs: {
        dataLookup: DataLookup;
    }
    static parseValue(dateTime, props) {
        if (!dateTime || props.hasTime) return dateTime;
        return dateTime.toString().split('T')[0];
    }
    static parseDateTime(value, defaultTime, hasTime, timeSeconds) {
        value = value || '';
        let [date, time] = value.replace('T', ' ').split(' ');

        if (!time) time = defaultTime;
        if (typeof time == 'string') {
            const timeParts = time.split(':');
            if (timeParts.length == 2) timeParts.push(timeSeconds);
            time = timeParts.join(':');
        }
        date = date.split('/').join('-');
        return [date, hasTime && time].filter(notFalse => notFalse).join(' ');
    }
    static passFilterItem(filterItem: FilterItem, p) {
        const hasTime = p.hasTime || (p.children && p.children.props.hasTime);
        const op = (filterItem.op || '').toLowerCase();
        if (!filterItem.value) return filterItem;
        if (op.startsWith('<')) filterItem.value = DatePicker.parseDateTime(filterItem.value, '23:59:59', hasTime, '59');
        if (op.startsWith('>')) filterItem.value = DatePicker.parseDateTime(filterItem.value, '00:00:00', hasTime, '00');
        if (op == 'between') {
            filterItem.value = DatePicker.parseDateTime(filterItem.value, '00:00:00', hasTime, '00');
            filterItem.value2 = DatePicker.parseDateTime(filterItem.value2, '23:59:59', hasTime, '59');
        }
        return filterItem;
    }
    static handleDisplayText(value: string, hasTime?, textOnly?, editorPrefix?): JSX.Element | string {
        const v = value;
        value = value && value.toString();
        if (value && value.indexOf('T') && typeof v == 'string') value = value.split('T')[0];
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
        if (typeof value == 'string' && value.endsWith('PM'))
            time = time.split(':').filter((x, idx) => (idx == 0 ? (+x + 12) : x)).join(':');
        if (hasTime && !time) time = editorPrefix == 'alt' ? '23:59' : '00:00';
        if (textOnly) {
            const result = m && m.isValid() && [m.format('jYYYY/jMM/jDD'), hasTime && time].filter(notFalse => notFalse).join(' ');
            return result;
        }
        return !!m && m.isValid() && <span className="shamsi-date-cell">
            <span style={{ float: 'left' }}>
                {m && m.format('jYYYY/jMM/jDD')}
            </span>

            {!!hasTime && <span style={{ float: 'right', margin: '0 1rem' }}>
                {time}
            </span>}</span>
    }
    @SelfBind()
    handleBlurTime(e: React.ChangeEvent<HTMLInputElement>) {

    }
    @SelfBind()
    handleBlur(e: React.ChangeEvent<HTMLInputElement>) {
        function inject(orginals: string[], currentValues: string[]) {
            return orginals.slice(0, orginals.length - currentValues.length).concat(currentValues);
        }
        const { onBlur } = this.props;
        if (onBlur instanceof Function) onBlur(e);
        const m = moment();
        const orgDates = ['jYYYY', 'jMM', 'jDD'].map(format => m.format(format));
        const { currentTarget } = e || {} as React.ChangeEvent<HTMLInputElement>;
        let { value } = currentTarget;

        if (value && (value.startsWith('+') || value.startsWith('-'))) {
            const sig = parseInt(value);
            value = m.add(sig, 'day').format('jYYYY/jMM/jDD');
        }
        let [date, time] = (value || '').split(' ');
        date = date.split('-').join('/').split('.').join('/');
        date = date.split('/').map(part => part.length == 1 ? '0' + part : part).join('/');
        date = Array.from(date).filter(ch => /[0-9]/.test(ch)).join('');
        if (date.length == 3) date = '0' + date;
        if (date.length == 4) date = [0, 2].map(idx => date.substr(idx, 2)).join('/');
        if (date.length == 6) date = orgDates[0].substr(0, 2) + date;
        if (date.length == 8)
            date = [date.substr(0, 4), date.substr(4, 2), date.substr(6, 2)].join('/');
        const dateParts = date && inject(orgDates, date.split('/'));
        if (typeof time == 'string' && !time.includes(':')) time = time.substr(0, 2) + ':' + time.substr(3, 2);
        const timeParts = time && time.split(':');
        const newValueParts = [dateParts && dateParts.join('/'), timeParts && timeParts.join(':')].filter(notFalse => notFalse);
        const newVal = newValueParts.join(' ');
        const newValue = moment(newVal, newValueParts.length == 1 ? 'jYYYY/jMM/jDD' : 'jYYYY/jMM/jDD hh:mm');
        if (newValue && newValue.isValid()) {
            currentTarget.value = newVal;
            const date = newValue.format('YYYY/MM/DD');
            this.props.onChange([date, time].filter(notFalse => notFalse).join(' '));
        }
        else {
            currentTarget.value = '';
            this.props.onChange(null);
        }
        this.state.lastBlur = +new Date();
    }
    getTextField() {
        const now = +new Date();
        if (!this.state.lastBlur || (now - this.state.lastBlur > 1000)) this.state.key = null;
        this.state.key = this.state.key || !!this.props.value ? 'NotNull' : 'Null';
        const { key } = this.state, { onFocus, readonly: disabled, hasTime } = this.props;
        const { value } = this.props;
        const defaultValue = DatePicker.handleDisplayText(value, hasTime, true, this.props.editorPrefix) as string;

        return <TextField
            style={{ direction: defaultValue && hasTime ? 'ltr' : null }} className="date-picker-edit" key={(defaultValue || 'N') + key} placeholder={this.props.placeholder && i18n.get(this.props.placeholder)}
            inputProps={{ onBlur: this.handleBlur as any }}
            {...{ defaultValue, onFocus, disabled }} />

    }
    renderContent() {
        const p = this.props;

        return <DataLookup ref="dataLookup" iconCode={null}
            onDisplayText={DatePicker.handleDisplayText} minHeightForPopup="350px"
            {...this.props} className={Utils.classNames("date-picker", p.className)}
            onBlur={this.handleBlur}
            source={DatePickerContent}
            popOverReversed={!!p.popOverReversed}
            textField={this.getTextField()}
            style={p.style}
            disableAdjustEditorPadding={true}
        />
    }
    static textReader(fieldProps, props, value) {
        return DatePicker.handleDisplayText(value, props.hasTime);
    }
    static inlineMode: boolean = true;
    static defaultOperator = 'between';
    static defaultAltProps = {
        placeholder: 'to-value'
    }
}
DatePicker['classNameForField'] = 'date-picker-field';
loadPersian();

_moment['suppressDeprecationWarnings'] = true;
const persianNumber = x => x;
Object.assign(persian, { persianNumber });
Object.assign(window, { moment });