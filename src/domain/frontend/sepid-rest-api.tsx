const { changeCase, refetchFactory } = OrganicUI;
const webApiSettings: refetchFactoryOptions = () => {
    return {
        baseURL: `http://${location.hostname}:51368/`,
        headers: {
            'Authorization': 'Bearer CDfMBq7W1UiatgALQvDDS6XxPViQ3jGa',
            'Access-Control-Allow-Origin': '*'
        }
    };
}
const webApi = refetchFactory(webApiSettings);
export const SepidRESTService = {
    login: data => webApi("POST", '/SepidRESTService/Authentication/Login', data),
    
}
/*
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
    create: targetOfEntity => data => webApi('POST', `/api/${targetOfEntity}`, data),
    findById: targetOfEntity => id => webApi('GET', `/api/${targetOfEntity}/${id}`),
    readList: targetOfEntity => queryParams => webApi('GET', `/api/${targetOfEntity}`, queryParams),
    updateById: targetOfEntity => (id, data) => webApi('PUT', `/api/${targetOfEntity}/${id}`, data),
    deleteById: targetOfEntity => id => webApi('DELETE', `/api/${targetOfEntity}/${id}`),
    patchById: targetOfEntity => id => webApi('PATCH', `/api/${targetOfEntity}/${id}`),
    readById: targetOfEntity => id => webApi('GET', `/api/${targetOfEntity}/${id}`),
}

function webApiProxy() {
    return new Proxy({}, {
        get: function (target, prop: string, receiver) {

            let result = webApiMethods[prop];
            if (result) return result;
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

export const sepidApi: any = webApiProxy();*/
Object.assign(window, { webApi });