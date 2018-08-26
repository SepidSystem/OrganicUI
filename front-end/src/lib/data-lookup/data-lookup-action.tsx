import { BaseComponent } from "../core/base-component";
import { AdvButton } from "../core/ui-elements";
import { DataLookup } from './data-lookup';
interface IState {
    isLoading: boolean;
}
export class DataLookupAction extends BaseComponent<OrganicUi.IDataLookupActionProps, IState> {
    static predefinedContentByLabel: { [key: string]: JSX.Element } = {};
    renderContent() {
        const { label } = this.props;
        const content = DataLookupAction.predefinedContentByLabel[label] || label;
        if (typeof content == 'object' && !React.isValidElement(content))
            return React.cloneElement(content, { onClick: this.handleClick.bind(this) })
        return <AdvButton onClick={this.handleClick.bind(this)}>{content}</AdvButton>
    }
    handleClick(e: React.MouseEvent<HTMLElement>) {
        e.preventDefault();
        const { currentTarget } = e;
        const { onExecute } = this.props;
         let dataLookupHTMLElement = currentTarget;
        let dataLookup: DataLookup;
        while (!dataLookupHTMLElement) {
            if (dataLookupHTMLElement.classList.contains('data-lookup')) {
                const { componentRef } = dataLookupHTMLElement as any;
                if (componentRef instanceof DataLookup) {
                    dataLookup = componentRef;
                    break;
                }
            }
            dataLookupHTMLElement = dataLookupHTMLElement.parentElement;
        }
        if (!dataLookup) throw `connected  dataLookup not found`;
        return onExecute().then(id => dataLookup.setValue(id));
    }
}
Object.assign(DataLookup, { Action: DataLookupAction });