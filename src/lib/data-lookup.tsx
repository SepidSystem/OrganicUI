import { BaseComponent } from './base-component';
import { templates, icon, i18n } from './shared-vars';
import { Utils } from './utils';


import { isDevelopmentMode } from './developer-friendly';
import { TextField } from 'office-ui-fabric-react';
interface DataLookupProps {
    source: StatelessListView;
}
interface DataLookupState {

}
export class DataLookup extends BaseComponent<DataLookupProps, DataLookupState>{
    render() {
        const p = this.props;
        return <div ref="root">
            <TextField label="Standard" />
            {React.createElement(p.source, { isPopup: true } as Partial<IListViewParams>)}
        </div>
    }
}
React.createElement