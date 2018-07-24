import { BaseComponent } from "./base-component";
import { openRegistry } from './registry';
interface IState {

}
export class UiModule extends BaseComponent<OrganicUi.UiModuleProps, IState>{
    static registeredModules = openRegistry();
    propsForMod: any;
    renderContent() {
        const { modName } = this.props;
        const mod = UiModule.registeredModules(modName);
        this.propsForMod = this.propsForMod || Object.keys(this.props)
            .filter(key => key.startsWith('data-'))
            .reduce((a, key) => (Object.assign({ [key.replace('data-', '')]: this.props[key] })), {})
        if (!(mod instanceof Function)) return this.renderErrorMode('Module not found', `${modName} not found`);
        return mod(this.propsForMod);
    }
} 