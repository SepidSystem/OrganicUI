import { changeCase } from "./utils";
import axios, { AxiosRequestConfig } from 'axios';
function delayedValue<T>(v: T, timeout): Promise<T> {

    return new Promise(resolve => setTimeout(() => resolve(v), timeout));
}
 
export function refetchFactory(options?:refetchFactoryOptions ) {
    function refetch(method: 'GET' | 'POST' | 'PUT' | 'HEAD' | 'PATCH' | 'DELETE', url: string, body?) {
        if (refetch['bodyMapper'])
            body = refetch['bodyMapper']({ method, url, body });

        if (method == 'GET' && body && Object.keys(body).length) {
            url = url + (url.includes('?') ? '&' : '?') + Object.keys(body).map(key => `${key}=${encodeURIComponent(body[key])}`).join('&');
        }

        if (method == 'GET') {
            const resultOfCache = refetch['cache'].get(url);
            if (resultOfCache) return Promise.resolve(resultOfCache);
        }
        if (!(['GET', 'HEAD'].includes(method)) && body)
            refetch['cache'].reset();
        const obj = options instanceof Function ? options() : options;
        const result = axios(Object.assign({}, { url, method, data: body }, obj || {})).then(resp => {

            const { headers } = resp;
            var result = changeCase.camelCase(resp.data);
            const headerPairs = typeof headers == 'object' ? headers : Array.from((headers as any).entries()).reduce((a, [key, value]) => (a[key] = value, a), {});

            if ('x-total-count' in headerPairs) {
                const totalRows = +headerPairs['x-total-count'];
                result = { totalRows, rows: result };
            }
            let rows: Array<any>[] = result.rows;
            if (rows instanceof Array && rows[0] instanceof Array) {
                const keys: string[] = result.rows[0];
                rows = rows.slice(1).map(r => {
                    let obj = {};
                    r.forEach((v, idx) => obj[keys[idx]] = v);
                    return obj;
                }) as any;
                rows = changeCase.camelCase(rows);
                Object.assign(result, { rows });
            }
            if (method == 'GET')
                refetch['cache'].set(url, result, 1000 * 10);

            if (refetch['delay']) return delayedValue(result, refetch['delay']);

            return result;


        }, error => {
            console.groupCollapsed(`${method} ${url.split('?')[0]}`);
            console.log(error);
            console.groupEnd();
            return Promise.reject(error);
        }
        );

        return Object.assign(result, { url, method, body });
    }
    Object.assign(refetch, { delay: 0, cache: LRU(200), bodyMapper: null })
    return refetch;
};
export const refetch = refetchFactory();
const patterns = {
    create: 'create(.+)',
    findById: 'find(.+)ById',
    readList: 'read(.+)List',
    updateById: 'update(.+)ById',
    deleteById: 'delete(.+)ById',
    patchById: 'patch(.+)ById',
    readById: 'read(.+)ById'
}
const patternActions = {
    create: targetOfEntity => data => refetch('POST', `/api/${targetOfEntity}`, data),
    findById: targetOfEntity => id => refetch('GET', `/api/${targetOfEntity}/${id}`),
    readList: targetOfEntity => queryParams => refetch('GET', `/api/${targetOfEntity}`, queryParams),
    updateById: targetOfEntity => (id, data) => refetch('PUT', `/api/${targetOfEntity}/${id}`, data),
    deleteById: targetOfEntity => id => refetch('DELETE', `/api/${targetOfEntity}/${id}`),
    patchById: targetOfEntity => id => refetch('PATCH', `/api/${targetOfEntity}/${id}`),
    readById: targetOfEntity => id => refetch('GET', `/api/${targetOfEntity}/${id}`),
}

export function remoteApiProxy() {
    return new Proxy({}, {
        get: function (target, prop: string, receiver) {

            let result = null;
            for (const apiTarget in patterns) {
                const regExpr = new RegExp(patterns[apiTarget]);
                const regularResult = regExpr.exec(prop);
                if (!regularResult) continue;
                const generator = patternActions[apiTarget];
                console.assert(generator instanceof Function, `invalid generator for ${prop}@patternActions, but patterns is okey`);
                const targetOfEntity = changeCase.paramCase(regularResult[1]);
                result = generator(targetOfEntity);
                break;
            }
            return result || (params => Promise.reject(`invalid method:${prop}`));

        }
    })
}


export const remoteApi: any = remoteApiProxy();
Object.assign(window, { axios });