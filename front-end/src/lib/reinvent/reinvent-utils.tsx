import lru = require('lru_map');
const _utils: any = {};
 
export const utils = new Proxy(_utils, {
    get: key => {
        const method = _utils[key] as Function;
        return function (cacheKey) {

        }
    }
});