import { reinvent } from '../reinvent/reinvent';
import { BaseComponent } from '../core/base-component';
import { Paper } from '../controls/inspired-components';
import OrganicBox from './organic-box';

export class CardView extends OrganicBox<any, any, any, IState>{
    applyDOM(){
        
    }
    renderContent() {
        const s = this.state;
        return <Paper className={!s.applied ? 'card-view-invisible' : 'card-view-visible'}  >

        </Paper>
    }
}
interface IState {
    applied: boolean;
}
reinvent.templates['card-view'] = CardView;