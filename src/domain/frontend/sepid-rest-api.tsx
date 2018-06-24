/// <reference path="../../organicUI.d.ts" />
/// <reference path="./entities.d.ts" />
const { changeCase, refetchFactory } = OrganicUI;
const webApiSettings: refetchFactoryOptions = () => {
    const token = localStorage.getItem('token');

    if (!location.href.endsWith('/login') && !token) location.href = '/view/auth/login';
    return {
        baseURL: `http://${location.hostname}:51368/`,
        headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Access-Control-Allow-Origin': '*'
        },
        validateStatus: status => {
            if (status == 401) location.href = '/view/auth/login?message=session-expired';
            if (status == 403) location.href = '/view/auth/login';
            return status == 200;
        }
    };
}
const webApi = refetchFactory(webApiSettings);

export interface IRowListResultDto<T> {
    rows: T[];
    totalRows: number;
}
export interface IResponseForLogin {
    success: boolean;
    message: string;
    token: string;
}
export interface IResponseForGetCurrentUser {
    username: string;
    accessibleModules: any[];


}
export const AuthenticationController = {
    login: (data: { username, password }) =>
        webApi<IResponseForLogin>("POST", '/SepidRESTService/Authentication/Login', data).then(
            r => {
                if (r.success) {
                    localStorage.setItem('token', r.token);
                    setTimeout(() => location.href = '/view/dashboard', 2000);
                }
                return r;
            }
        )
    ,
    getCurrentUserInformation: () => webApi<IResponseForGetCurrentUser>('POST', '/SepidRESTService/Authentication/CurrentUserInformation')
}
export const BasicController = {
    getVersion: () => webApi<string>("GET", "/SepidRESTService/BasicInfo/GetVersion")
}
function crudControllerFactory<T>(pluralName: string, singularName?): IActionsForCRUD<T> {
    singularName = singularName || (pluralName.endsWith('s') ? pluralName.substr(0, pluralName.length - 1) : pluralName);
    return {
        handleReadList: data => webApi('POST', `/SepidRESTService/${pluralName}/${singularName}ListEx`, data),
        handleRead: id => webApi('GET', `/SepidRESTService/${pluralName}/${singularName}/${id}`),
        handleCreate: data => webApi('POST', `/SepidRESTService/${pluralName}/${singularName}`, data),
        handleDeleteList: id => webApi('POST', `/SepidRESTService/${pluralName}/DeleteList`, id),
        handleUpdate: (id, data) => webApi('PUT', `/SepidRESTService/${pluralName}/${singularName}`, data)
    };
}
export const UserController = crudControllerFactory<UserDTO>('Users');
export const UserGroupController = crudControllerFactory<UserDTO>('UserGroups');
export const DeviceController = crudControllerFactory<UserDTO>('Devices');
//export const  
Object.assign(window, { webApi, BasicController });