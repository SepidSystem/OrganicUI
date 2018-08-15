import { BaseComponent } from "../lib/core/base-component";
interface IState {

}
export class UiKit extends BaseComponent<OrganicUi.UiKitProps, IState>{
    propsForMod: any;
    renderContent() {
        const { id } = this.props;
        const kit = uiKits(id);
        this.propsForMod = this.propsForMod || Object.keys(this.props)
            .filter(key => key.startsWith('data-'))
            .reduce((a, key) => (Object.assign({ [key.replace('data-', '')]: this.props[key] })), {})
        if (!(kit instanceof Function)) return this.renderErrorMode('Module not found', `${id} not found`);
        return kit(this.propsForMod);
    }
}

import './change-user-language';
import { uiKits } from "../lib/core/shared-vars";
