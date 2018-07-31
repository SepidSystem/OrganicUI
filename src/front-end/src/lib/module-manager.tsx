import { loadScript } from "./bootstrapper";

export const moduleManager: OrganicUi.IModuleManager = {
    baseUrl: '/assets/bundle',
    _loadingModules: [],
    load(moduleId, src) {
        return new Promise(resolve => {
            moduleManager._loadingModules.push({ moduleId, resolve });
            src = src || `${moduleManager.baseUrl}/${moduleId}.js`;
            loadScript(src);
        })
    },
    register(moduleId, mod) {
        const loadingModule = moduleManager._loadingModules.filter(m => m.moduleId == moduleId);
        moduleManager._loadingModules = moduleManager._loadingModules.filter(m => m.moduleId != moduleId);
        loadingModule.forEach(m => m.resolve(mod));
    }

};