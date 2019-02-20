import { BaseComponent } from "../core/base-component";
import { AdvButton } from "../controls/adv-button";
import { Button } from '../controls/inspired-components';
import { DataLookup } from './data-lookup';
import { Utils } from "../core/utils";
interface IState {
    isLoading: boolean;
}
export class DataLookupAction extends BaseComponent<OrganicUi.IDataLookupActionProps, IState> {
    static predefinedContentByLabel: { [key: string]: (() => JSX.Element | JSX.Element) } = {};
    static isDataLookupButton = 1;
    renderContent() {
        const { label } = this.props;
        let content = DataLookupAction.predefinedContentByLabel[label] || label;
        if (content instanceof Function) content = content();
        if (React.isValidElement(content))
            return React.cloneElement(content, { onClick: this.handleClick.bind(this) } as any)
        return <Button onClick={this.handleClick.bind(this)}>{content}</Button>
    }
    handleClick(e: React.MouseEvent<HTMLElement>) {
        e && e.preventDefault instanceof Function && e.preventDefault();
        const { currentTarget } = e;
        const { onExecute } = this.props;
        let dataLookupHTMLElement = currentTarget;
        let dataLookup: DataLookup;
        while (dataLookupHTMLElement) {
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
DataLookupAction.predefinedContentByLabel = {
    plus: () => <Button >{Utils.showIcon('fa-plus')}</Button>
}
Object.assign(DataLookup, { Action: DataLookupAction });