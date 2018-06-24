/// <reference path="../../organicUI.d.ts" />


declare interface CustomerDTO {
    customerName: string;
    customerCode: string;
    phone: string;
    address: string;
    manager: any;
    personals: any[];
    licenses: any[];
}

 
declare interface DeviceDTO {
    id:number;
    code:string;
    model:number;
    modelStr:string;
    matchingMode:number;
    entranceMode:number;
    name:string;
    serial:string;
    active:number;
    ip:string;
    port:string;
    timeZone:string;
    gateway:string;
    subnet:string;
    firmewareVersion:string;
    enableDaylightSync:boolean;
    departmentId:number;
    useDhcp:boolean;
    syncTimeByServer:boolean;
    syncLog:boolean;
    syncTasks:boolean;
    syncLogPeriod:string;
    syncLogStartDate:string;
    authenticationMode:number;
    connectionStatusStr:string;
}
declare interface EmployeeDTO {

}
declare interface DepartmentDTO {
    departmentName: string;
}
declare interface UserDTO {
    id: number;
    username: string;
    password: string;
    confirmPassword: string;
    active: boolean;
    fullName: string;
    rolesIds: number[];
    dataItemGroupIds: number[];
}
declare interface UserGroupDTO {

}
declare interface RoleDTO {
    id: string;
    name: string;
    permissions: ITreeListNode[];
}