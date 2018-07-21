import { registryFactory } from "./registry-factory";
alert('dgdfg');
export const i18n = registryFactory<React.ReactNode>((registeredText, key) => (registeredText = registeredText || key, <span title={key} key={key} className="i18n" >{registeredText}</span>));
export const i18nAttr = key => i18n.get(key);
export const extraSheets = registryFactory<() => React.ReactNode>();
export const icon = registryFactory<any>((registeredIcon, key) => (registeredIcon = registeredIcon || 'mi-gesture', <span className="icon"><i title={key} className={[registeredIcon.split('-')[0], registeredIcon].join(' ')} /></span>));
export const editorByAccessor = registryFactory<React.ReactElement<any>>();
export const menuBar = registryFactory<string | Function>((result: any, key) => result instanceof Function ? result(key) : result);
export const appModules = registryFactory<OrganicUi.IAppModule>();
//--- for businness application & admin panels

export const tags = registryFactory((registeredText, key) => registeredText);
export const reports = registryFactory<() => any>((reportIntf, key) => reportIntf);
export const dashboardBlocks = registryFactory((registeredText, key) => registeredText);
export const acl = registryFactory<boolean>((result, key) => !!this.data.isAdmin || result);
export const listViews = registryFactory<string>();
export const businnessRules = registryFactory<(args) => Promise<any>>();