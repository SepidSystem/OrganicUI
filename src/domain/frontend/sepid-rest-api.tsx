/// <reference path="../../dts/organic-ui.d.ts" />
import { createClientForREST, IActionsForCRUD, OptionsForRESTClient, IListData, IAdvancedQueryFilters, isProdMode } from "@organic-ui";
import { AppEntities } from "./entities";
const webApiClientSettings: OptionsForRESTClient = () => {
    const token = localStorage.getItem('token');
    const baseURL = isProdMode() && localStorage.getItem('baseURL');
    if (!location.href.endsWith('/login') && !token) location.href = '/view/auth/login';

    return {
        baseURL: baseURL || `http://192.168.1.66:41368/`,//  `http://${location.hostname}:51368/`,
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
    const readList = (data: IAdvancedQueryFilters) => webApi<IListData<T>>('POST', `/SepidRESTService/${pluralName}/${singularName}ListEx`, data);


    return {
        readList,
        read: id => webApi('GET', `/SepidRESTService/${pluralName}/${singularName}/${id}`),
        create: data => webApi('POST', `/SepidRESTService/${pluralName}/${singularName}`, data),
        deleteList: ids => webApi('POST', `/SepidRESTService/${pluralName}/DeleteList`, ids),
        update: (id, data) => webApi('PUT', `/SepidRESTService/${pluralName}/${singularName}`, data),
        getText:dto=>(dto as any).name
    };
}
function simpleReadListFactory<T>(pluralName, singularName) {
    return (data: IAdvancedQueryFilters) => webApi<OrganicUi.IListData<T>>('POST', `/SepidRESTService/${pluralName}/${singularName}List`, data);
}
export const RolesController = crudControllerFactory<AppEntities.RoleDTO>('Roles');
RolesController.readList = simpleReadListFactory('Roles', 'Role');
RolesController.getText = dto => dto.name;
export const UsersController = crudControllerFactory<AppEntities.UserDTO>('Users');
export const UserGroupsController = crudControllerFactory<AppEntities.UserDTO>('UserGroups');
export const DevicesController = crudControllerFactory<AppEntities.DeviceDTO>('Devices');
export const EmployeesController = crudControllerFactory<AppEntities.EmployeeDTO>('Employees');
function mapDepartments(items: AppEntities.DepartmentDTO[]) {
    const results: AppEntities.DepartmentDTO[] = JSON.parse(JSON.stringify(items));
    let counter = 0;
    while (counter < results.length) {
        const item = results[counter];
        item.subDepartments && results.push(...item.subDepartments);
        counter++;
    }
    return results;
}
export const DepartmentsController = crudControllerFactory<AppEntities.DepartmentDTO>('Departments');
DepartmentsController.readList = (data: IAdvancedQueryFilters) => webApi<OrganicUi.IListData<AppEntities.DepartmentDTO>>('POST', `/SepidRESTService/Departments/DepartmentList`, data).then(mapDepartments as any);
export const SchedulesController = crudControllerFactory('Schedules');
//export const  
Object.assign(window, { SchedulesController, webApi, BasicController });
