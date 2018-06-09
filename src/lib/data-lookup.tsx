import { BaseComponent } from './base-component';
import { templates, icon, i18n } from './shared-vars';
import { Utils } from './utils';


import { isDevelopmentMode } from './developer-friendly';
import { TextField } from 'office-ui-fabric-react';
interface DataLookupProps {
    source: StatelessListView;
}
interface DataLookupState {
    isOpen?: boolean;
}
export class DataLookup extends BaseComponent<DataLookupProps, DataLookupState>{
    render() {
        const p = this.props,s=this.state;
        console.log(p,s);
        return <div ref="root">
            <TextField label="Standard" onFocus={() => this.repatch({ isOpen: true })}
            
            onBlur={ ()=>setTimeout(  this.repatch({isOpen:false},20000))
        }
            />
            {JSON.stringify(s)}
            {!!s.isOpen  
                
               && React.createElement(p.source, { forDataLookup: true } as Partial<IListViewParams>)
            }
        </div>
    }
}
React.createElement