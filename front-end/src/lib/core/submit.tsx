
import { BaseComponent } from './base-component';
interface IState {
    executing: boolean;
}
export class Submit extends BaseComponent<OrganicUi.ISubmitProps, IState>{
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }
    handleClick() {

    }
    render() {
        const { buttonComponent } = this.props;

        return <this.props.buttonComponent  >
            {this.props.children}
        </this.props.buttonComponent>
    }


}