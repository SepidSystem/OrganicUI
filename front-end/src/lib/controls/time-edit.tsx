 
import { BaseComponent } from '../core/base-component';
import { ITimeEditProps } from '@organic-ui';
import { ChangeEventHandler } from 'react';
import { TextField } from './inspired-components';
interface IState {
    value: string;
}
const pad2 = s => {

    const ss = ('000' + s);
    return ss.substr(ss.length - 2, 2);
}
export class TimeEdit extends BaseComponent<ITimeEditProps, IState>{
    truncateSeconds() {
        let value = this.state.value || this.props.value;
        if (!value || this.props.keepSeconds) return;
        value = value.split(':').slice(0, 2).join(':');
          if (this.state.value != value) this.repatch({ value });

    }
    tryToFixValue() {
        let value = this.state.value || this.props.value;
        if (!value) return;
        const { onChange } = this.props;
        if (value.includes(':'))
            value = value.split(':').map(part => pad2(part)).join(':');
        else
            value = [0, 2, this.props.keepSeconds ? 4 : -1]
                .map(startFrom => (startFrom >= 0) && pad2(value.substr(startFrom, 2)))
                .filter(s => !!s).join(':');
        if (this.state.value != value) this.repatch({ value });
        onChange instanceof Function && onChange({ target: { value } } as any);
    }

    componentDidMount() {
        super.componentDidMount();
        this.truncateSeconds();
        this.tryToFixValue();
    }
    render() {
        const p = this.props;
        if (this.state.value === undefined) {
            setTimeout(() => this.componentDidMount(), 10);
        }
        this.state.value = this.state.value || this.props.value;

        return <TextField   dir="ltr" style={{direction:'ltr'}}
            value={this.state.value} placeholder={p.keepSeconds ? '00:00:00' : '00:00'}
            onChange={e => { this.state.value = e.target.value, p.onChange instanceof Function && p.onChange(e as any) as any }}
            onBlur={() => this.tryToFixValue()}
        />
    }
}