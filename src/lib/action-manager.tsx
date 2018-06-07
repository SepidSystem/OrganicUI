import { changeCase } from "./utils";

function delayedValue<T>(v: T, timeout): Promise<T> {

    return new Promise(resolve => setTimeout(() => resolve(v), timeout));
}
export class ActionManager {
    static cache = LRU(200);
    static fetchDelay = 0;
    static bodyMapper: Function;
    public verifyBySchema(data, schema): true | Error {
        return null;
    }
    public refetch(method: 'GET' | 'POST' | 'PUT' | 'HEAD' | 'PATCH' | 'DELETE', url: string, body?) {
        if (ActionManager.bodyMapper)
            body = ActionManager.bodyMapper({ method, url, body });

        if (method == 'GET' && body && Object.keys(body).length) {
            url = url + (url.includes('?') ? '&' : '?') + Object.keys(body).map(key => `${key}=${encodeURIComponent(body[key])}`).join('&');
        }
        const headers: HeadersInit = {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        } as any;
        if (method == 'GET') {
            const resultOfCache = ActionManager.cache.get(url);
            if (resultOfCache) return Promise.resolve(resultOfCache);
        }
        const requestOpts: RequestInit = { method, headers } as any;
        if (!(['GET', 'HEAD'].includes(method)) && body) {
            ActionManager.cache.reset();
            Object.assign(requestOpts, { body: JSON.stringify(body) });
        }
        const result = fetch(url, requestOpts).then(resp => {
            if (!resp.ok) {
                console.error(method, url, resp.statusText);
                resp.text().then(console.log);
                return Promise.reject(resp.statusText);
            }
            const { headers } = resp;
            var result = resp.json().then(json => changeCase.camelCase(json));
            const headerPairs = Array.from((headers as any).entries()).reduce((a, [key, value]) => (a[key] = value, a), {});

            if ('x-total-count' in headerPairs) {
                const totalRows = +headerPairs['x-total-count'];
                 
                result = result.then(rows => ({ totalRows, rows }));
                console.log({totalRows});
            }
            result.then(json => {
                let rows: Array<any>[] = json.rows;
                if (rows instanceof Array && rows[0] instanceof Array) {
                    const keys: string[] = json.rows[0];
                    rows = rows.slice(1).map(r => {
                        let obj = {};
                        r.forEach((v, idx) => obj[keys[idx]] = v);
                        return obj;
                    }) as any;
                    rows = changeCase.camelCase(rows);
                    Object.assign(json, { rows });
                }
                if (method == 'GET')
                    ActionManager.cache.set(url, json, 1000 * 10);
                return json;
            });
            if (ActionManager.fetchDelay) return delayedValue(result, ActionManager.fetchDelay);

            return result;


        });

        return Object.assign(result, { url, method, body });
    }

}
const settings = {
    defaultMajorRouters: ['Customer', 'SampleEntity'],
    unixStyle: false
}
const patterns = {
    create: 'create(.+)',
    findById: 'find(.+)ById',
    readList: 'read(.+)List',
    updateById: 'update(.+)ById',
    deleteById: 'delete(.+)ById',
    patchById: 'patch(.+)ById',
    readById: 'read(.+)ById'

}
export function remoteApiProxy(specifiedApi?) {
    return new Proxy(new ActionManager(), {
        get: function (target, prop: string, receiver) {
            if (specifiedApi instanceof Function) {
                const func = specifiedApi(target)[prop];
                if (func instanceof Function) return func();
            }

            for (const apiTarget in patterns) {
                const regExpr = new RegExp(patterns[apiTarget]);
                const regularResult = regExpr.exec(prop);
                if (!regularResult) continue;

                const targetOfEntity = changeCase.paramCase(regularResult[1]);
                if (apiTarget == 'create')
                    return data => target.refetch('POST', `/api/${targetOfEntity}`, data);
                if (apiTarget == 'findById')
                    return id => target.refetch('GET', `/api/${targetOfEntity}/${id}`);
                if (apiTarget == 'readList')
                    return queryParams => target.refetch('GET', `/api/${targetOfEntity}`, queryParams);
                if (apiTarget == 'updateById')
                    return (id, data) => target.refetch('PUT', `/api/${targetOfEntity}/${id}`, data);
                if (apiTarget == 'deleteById')
                    return id => target.refetch('DELETE', `/api/${targetOfEntity}/${id}`);
                if (apiTarget == 'patchById')
                    return id => target.refetch('PATCH', `/api/${targetOfEntity}/${id}`);


            }
            // CUSTOM ACTION
            return params => Promise.reject(`invalid method:${prop}`);

        }
    })
}
Object.assign(remoteApiProxy, { settings });
export const remoteApi: any = remoteApiProxy();