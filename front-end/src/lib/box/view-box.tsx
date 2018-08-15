import OrganicBox from './organic-box';
import { Utils } from '../core/utils';


interface ViewBoxState { formData: any; validated: boolean; }
export interface IOptionsForViewBox {
    className?: string  
}
interface IActionsForViewBox {

}
export class ViewBox<T=any> extends OrganicBox<
    IActionsForViewBox, IOptionsForViewBox, T, ViewBoxState> {
    constructor(p) {
        super(p);

    }
    renderContent(p=this.props){
        return <section  className={Utils.classNames(  "view-box",p.options.className)} ref="root">
        {this.props.children}
            </section>
    }
}
