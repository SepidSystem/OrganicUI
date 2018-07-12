/// <reference path="entities.d.ts" />

import { AppEntities } from "./entities";
import { PromisedResultSet, ActionResult } from "@organic-ui";


declare interface CustomerAPI {
    createCustomer(customer: AppEntities.CustomerDTO): ActionResult;
    readCustomerList(params): PromisedResultSet<AppEntities.CustomerDTO>, findCustomerById(id): Promise<AppEntities.CustomerDTO>;
    updateCustomerById(id, customer: AppEntities.CustomerDTO): ActionResult;
    deleteCustomerById(id): ActionResult;
}
declare interface DeviceAPI {
    createDevice(device: AppEntities.DeviceDTO): ActionResult;
    readDeviceList(params): PromisedResultSet<AppEntities.DeviceDTO>, findDeviceById(id): Promise<AppEntities.DeviceDTO>;
    updateDeviceById(id, device: AppEntities.DeviceDTO): ActionResult;
    deleteDeviceById(id): ActionResult;
}
declare interface EmployeeAPI {
    createEmployee(employee: AppEntities.EmployeeDTO): ActionResult;
    readEmployeeList(params): PromisedResultSet<AppEntities.EmployeeDTO>, findEmployeeById(id): Promise<AppEntities.EmployeeDTO>;
    updateEmployeeById(id, employee: AppEntities.EmployeeDTO): ActionResult;
    deleteEmployeeById(id): ActionResult;
}
declare interface DepartmentAPI {
    createDepartment(department: AppEntities.DepartmentDTO): ActionResult;
    readDepartmentList(params): PromisedResultSet<AppEntities.DepartmentDTO>, findDepartmentById(id): Promise<AppEntities.DepartmentDTO>;
    updateDepartmentById(id, department: AppEntities.DepartmentDTO): ActionResult;
    deleteDepartmentById(id): ActionResult;
}
declare interface UserAPI {
    createUser(user: AppEntities.UserDTO): ActionResult;
    readUserList(params): PromisedResultSet<AppEntities.UserDTO>, findUserById(id): Promise<AppEntities.UserDTO>;
    updateUserById(id, user: AppEntities.UserDTO): ActionResult;
    deleteUserById(id): ActionResult;
}
declare interface UserGroupAPI {
    createUserGroup(userGroup: AppEntities.UserGroupDTO): ActionResult;
    readUserGroupList(params): PromisedResultSet<AppEntities.UserGroupDTO>, findUserGroupById(id): Promise<AppEntities.UserGroupDTO>;
    updateUserGroupById(id, userGroup: AppEntities.UserGroupDTO): ActionResult;
    deleteUserGroupById(id): ActionResult;
}
declare interface RoleAPI {
    createRole(Role: AppEntities.RoleDTO): ActionResult;
    readRoleList(params): PromisedResultSet<AppEntities.RoleDTO>, findRoleById(id): Promise<AppEntities.RoleDTO>;
    updateRoleById(id, role: AppEntities.RoleDTO): ActionResult;
    deleteRoleById(id): ActionResult;
}
declare interface SettingsAPI {

}

