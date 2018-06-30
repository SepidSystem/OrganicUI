/// <reference path="../../organicUI.d.ts" />
/// <reference path="./entities.d.ts" />
const { changeCase, createClientForREST } = OrganicUI;
const webApiClientSettings: OptionsForRESTClient = () => {
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
export const webApi = createClientForREST(webApiClientSettings);

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

function crudControllerFactory<T>(pluralName: string, { singularName, extraReadList } = {} as any): IActionsForCRUD<T> {
    singularName = singularName || (pluralName.endsWith('s') ? pluralName.substr(0, pluralName.length - 1) : pluralName);
    const handleReadList = (data: IAdvancedQueryFilters) => webApi<IListData<T>>('POST', `/SepidRESTService/${pluralName}/${singularName}ListEx`, data);


    return {
        handleReadList,
        handleRead: id => webApi('GET', `/SepidRESTService/${pluralName}/${singularName}/${id}`),
        handleCreate: data => webApi('POST', `/SepidRESTService/${pluralName}/${singularName}`, data),
        handleDeleteList: ids => webApi('POST', `/SepidRESTService/${pluralName}/DeleteList`, ids),
        handleUpdate: (id, data) => webApi('PUT', `/SepidRESTService/${pluralName}/${singularName}`, data)
    };
}
function simpleReadListFactory<T>(pluralName, singularName) {
    return (data: IAdvancedQueryFilters) => webApi<IListData<T>>('POST', `/SepidRESTService/${pluralName}/${singularName}List`, data);
}
export const RolesController = crudControllerFactory<RoleDTO>('Roles');
RolesController.handleReadList = simpleReadListFactory('Roles', 'Role');
 
export const UsersController = crudControllerFactory<UserDTO>('Users');
export const UserGroupsController = crudControllerFactory<UserDTO>('UserGroups');
export const DevicesController = crudControllerFactory<DeviceDTO>('Devices');
export const EmployeesController = crudControllerFactory<EmployeeDTO>('Employees');
function mapDepartments(items: DepartmentDTO[]) {
    const results: DepartmentDTO[] = JSON.parse(JSON.stringify(items));
    let counter = 0;
    while (counter < results.length) {
        const item = results[counter];
        item.subDepartments && results.push(...item.subDepartments);
        counter++;
    }
    return results;
}
export const DepartmentsController = crudControllerFactory<DepartmentDTO>('Departments');
DepartmentsController.handleReadList = (data: IAdvancedQueryFilters) => webApi<IListData<DepartmentDTO>>('POST', `/SepidRESTService/Departments/DepartmentList`, data).then(mapDepartments as any);
//export const  
Object.assign(window, { webApi, BasicController });