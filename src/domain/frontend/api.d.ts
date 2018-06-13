/// <reference path="entities.d.ts" />


declare interface CustomerAPI {
    createCustomer(customer: CustomerDTO): ActionResult;
    readCustomerList(params): PromisedResultSet<CustomerDTO>, findCustomerById(id): Promise<CustomerDTO>;
    updateCustomerById(id, customer: CustomerDTO): ActionResult;
    deleteCustomerById(id): ActionResult;
}
declare interface DeviceAPI {
    createDevice(device: DeviceDTO): ActionResult;
    readDeviceList(params): PromisedResultSet<DeviceDTO>, findDeviceById(id): Promise<DeviceDTO>;
    updateDeviceById(id, device: DeviceDTO): ActionResult;
    deleteDeviceById(id): ActionResult;
}
declare interface EmployeeAPI {
    createEmployee(employee: EmployeeDTO): ActionResult;
    readEmployeeList(params): PromisedResultSet<EmployeeDTO>, findEmployeeById(id): Promise<EmployeeDTO>;
    updateEmployeeById(id, employee: EmployeeDTO): ActionResult;
    deleteEmployeeById(id): ActionResult;
}
declare interface DepartmentAPI {
    createDepartment(department: DepartmentDTO): ActionResult;
    readDepartmentList(params): PromisedResultSet<DepartmentDTO>, findDepartmentById(id): Promise<DepartmentDTO>;
    updateDepartmentById(id, department: DepartmentDTO): ActionResult;
    deleteDepartmentById(id): ActionResult;
}
declare interface UserAPI {
    createUser(user: UserDTO): ActionResult;
    readUserList(params): PromisedResultSet<UserDTO>, findUserById(id): Promise<UserDTO>;
    updateUserById(id, user: UserDTO): ActionResult;
    deleteUserById(id): ActionResult;
}
declare interface UserGroupAPI {
    createUserGroup(userGroup: UserGroupDTO): ActionResult;
    readUserGroupList(params): PromisedResultSet<UserGroupDTO>, findUserGroupById(id): Promise<UserGroupDTO>;
    updateUserGroupById(id, userGroup: UserGroupDTO): ActionResult;
    deleteUserGroupById(id): ActionResult;
}
declare interface RoleAPI {
    createRole(Role: RoleDTO): ActionResult;
    readRoleList(params): PromisedResultSet<RoleDTO>, findRoleById(id): Promise<RoleDTO>;
    updateRoleById(id, role: RoleDTO): ActionResult;
    deleteRoleById(id): ActionResult;
}
declare interface SettingsAPI {

}

