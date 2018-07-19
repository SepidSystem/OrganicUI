import { changeCase } from "./utils";
import axios, { AxiosRequestConfig } from 'axios';
import { AppUtils } from "./app-utils";
import { OptionsForRESTClient } from "@organic-ui";
import * as curl from 'curl-cmd'; // href

function delayedValue<T>(v: T, timeout): Promise<T> {

    return new Promise(resolve => setTimeout(() => resolve(v), timeout));
}

export const instances = [];
export function createClientForREST(options?: OptionsForRESTClient) {
    async function restClient<T={}>(method: 'GET' | 'POST' | 'PUT' | 'HEAD' | 'PATCH' | 'DELETE', url: string, data?): Promise<T> {
        if (restClient['bodyMapper'])
            data = restClient['bodyMapper']({ method, url, body: data });

        if (method == 'GET' && data && Object.keys(data).length) {
            url = url + (url.includes('?') ? '&' : '?') + Object.keys(data).map(key => `${key}=${encodeURIComponent(data[key])}`).join('&');
        }
        //if (method == 'GET') {
        //  const resultOfCache = restClient['cache'].get(url);
        //  if (resultOfCache) return Promise.resolve(resultOfCache);
        //}
        if (!(['GET', 'HEAD'].includes(method)) && data)
            restClient['cache'].reset();
        const params = { url, method, data, options };
        Object.assign(createClientForREST, { lastRequest: params });

        const firstPromise = (restClient['confrim'] instanceof Function) ?
            restClient['confrim'](Object.assign({ mode: 0 }, params)) as Promise<T> : (Promise.resolve(false) as any) as Promise<T>;
        const opts = options instanceof Function ? options() : options;
        Object.assign(params, opts);
        let showResponse = false;
        const result = firstPromise
            .then(activate => (showResponse = !!activate, activate))
            .then(() => axios(params)).then(resp => {

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
                    restClient['cache'].set(url, result, 1000 * 10);

                if (restClient['delay']) return delayedValue(result, restClient['delay']);
                if (showResponse)
                    return restClient['confrim'](Object.assign({ mode: 2 }, params, { result })).then(() => result);
                else
                    return result;


            }).then(result => AppUtils.afterREST instanceof Function ? AppUtils.afterREST({ url, data, method, result }) : result);
        Object.assign(result, { url, method, data });
        return result;
    }
    Object.assign(restClient, { options, delay: 0, cache: LRU(200), bodyMapper: null });
    instances.push(restClient);
    return restClient;
};
/*
export const refetch = createClientForREST();
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


export const remoteApi: any = remoteApiProxy();*/
Object.assign(createClientForREST, { instances });
Object.assign(window, { axios });