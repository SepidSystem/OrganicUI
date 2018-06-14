import { changeCase } from "./utils";

function delayedValue<T>(v: T, timeout): Promise<T> {

    return new Promise(resolve => setTimeout(() => resolve(v), timeout));
}
export function refetch(method: 'GET' | 'POST' | 'PUT' | 'HEAD' | 'PATCH' | 'DELETE', url: string, body?) {
    if (refetch['bodyMapper'])
        body = refetch['bodyMapper']({ method, url, body });

    if (method == 'GET' && body && Object.keys(body).length) {
        url = url + (url.includes('?') ? '&' : '?') + Object.keys(body).map(key => `${key}=${encodeURIComponent(body[key])}`).join('&');
    }
    const headers: HeadersInit = {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
    } as any;
    if (method == 'GET') {
        const resultOfCache = refetch['cache'].get(url);
        if (resultOfCache) return Promise.resolve(resultOfCache);
    }
    const requestOpts: RequestInit = { method, headers } as any;
    if (!(['GET', 'HEAD'].includes(method)) && body) {
        refetch['cache'].reset();
        Object.assign(requestOpts, { body: JSON.stringify(body) });
    }
    const result = fetch(url, requestOpts).then(resp => {
        if (!resp.ok) {
            console.groupCollapsed(`${resp.statusText} | ${method} ${url.split('?')[0]}`);
            console.log('method>>>>>', method);
            console.log('url>>>>>', url);
            console.log('statusText>>>>>', resp.statusText);


            console.groupEnd();

            resp.text().then(console.log);
            return Promise.reject(resp.statusText);
        }
        const { headers } = resp;
        var result = resp.json().then(json => changeCase.camelCase(json));
        const headerPairs = Array.from((headers as any).entries()).reduce((a, [key, value]) => (a[key] = value, a), {});

        if ('x-total-count' in headerPairs) {
            const totalRows = +headerPairs['x-total-count'];
            result = result.then(rows => ({ totalRows, rows }));
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
                refetch['cache'].set(url, json, 1000 * 10);
            return json;
        });
        if (refetch['delay']) return delayedValue(result, refetch['delay']);

        return result;


    });

    return Object.assign(result, { url, method, body });
}
Object.assign(refetch, { delay: 0, cache: LRU(200), bodyMapper: null })

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
                /* if (apiTarget == 'create')
                     return data => refetch('POST', `/api/${targetOfEntity}`, data);
                 if (apiTarget == 'findById')
                     return id => refetch('GET', `/api/${targetOfEntity}/${id}`);
                 if (apiTarget == 'readList')
                     return queryParams => refetch('GET', `/api/${targetOfEntity}`, queryParams);
                 if (apiTarget == 'updateById')
                     return (id, data) => refetch('PUT', `/api/${targetOfEntity}/${id}`, data);
                 if (apiTarget == 'deleteById')
                     return id => refetch('DELETE', `/api/${targetOfEntity}/${id}`);
                 if (apiTarget == 'patchById')
                     return id => refetch('PATCH', `/api/${targetOfEntity}/${id}`);
 
 */
            }
            // CUSTOM ACTION
            return result || (params => Promise.reject(`invalid method:${prop}`));

        }
    })
}

export const remoteApi: any = remoteApiProxy();