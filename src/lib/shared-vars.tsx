import { openRegistry } from "./registry";
export const i18n = openRegistry<React.ReactNode>((registeredText, key) => (registeredText = registeredText || key, <span title={key} key={key} className="i18n" >{registeredText}</span>));
export const i18nAttr = key => i18n.get(key);
export const extraSheets = openRegistry<() => React.ReactNode>();
export const icon = openRegistry<any>((registeredIcon, key) => (registeredIcon = registeredIcon || 'mi-gesture', <span className="icon"><i title={key} className={[registeredIcon.split('-')[0], registeredIcon].join(' ')} /></span>));
export const editorByAccessor = openRegistry<React.ReactElement<any>>();
export const menuBar = openRegistry<string | Function>((result: any, key) => result instanceof Function ? result(key) : result);
export const appModules = openRegistry<OrganicUi.IAppModule>();
//--- for businness application & admin panels

export const tags = openRegistry((registeredText, key) => registeredText);
export const reports = openRegistry<() => any>((reportIntf, key) => reportIntf);
export const dashboardBlocks = openRegistry((registeredText, key) => registeredText);
export const acl = openRegistry<boolean>((result, key) => !!this.data.isAdmin || result);
export const listViews = openRegistry<string>();
export const businnessRules = openRegistry<(args) => Promise<any>>();