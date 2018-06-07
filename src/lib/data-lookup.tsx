import { BaseComponent } from './base-component';
import { templates, icon, i18n } from './shared-vars';
import { Utils } from './utils';


import { isDevelopmentEnv } from './developer-friendly';
import { TextField } from 'office-ui-fabric-react';
interface DataLookupProps {
    source: React.SFC<any> | React.ClassType<any, any, any>;
}
interface DataLookupState {

}
export class DataLookup extends BaseComponent<DataLookupProps, DataLookupState>{
    render() {
     const p =this.props;
        return <div ref="root">
            <TextField label="Standard" />
            {React.createElement(p.source)}
        </div>
    }
}
React.createElement