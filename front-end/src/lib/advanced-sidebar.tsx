import { BaseComponent } from "./base-component";
import { Utils } from "./utils";
interface IProps {

    className: string;
}
interface IState {
    selectedBlock: any;
}
export class AdvancedSideBar extends BaseComponent<IProps, IState>{
    render() {
        const { selectedBlock } = this.state;
        return (<div className={Utils.classNames("advanced-sidebar", this.props.className, !!this.state.selectedBlock && 'expanded')} >
            <a>
                <i className="fa fa-list"></i>
            </a> <a>
                <i className="fa fa-search"></i>
            </a> <a>
                <i className="fa fa-star"></i>
            </a>  <a>
                <i className="fa fa-print"></i>
            </a><a>
                <i className="fa fa-share"></i>
            </a> <a>
                <i className="fa fa-cog"></i>
            </a>
            {React.Children
                .toArray(this.props.children)
                .map(c => c as React.ReactElement<any>).filter(({ props }) => props && (props['data-block'] == selectedBlock))}
        </div>)
    }
}