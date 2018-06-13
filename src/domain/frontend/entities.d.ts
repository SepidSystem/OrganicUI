/// <reference path="../../organicUI.d.ts" />


declare interface CustomerDTO {
    customerName: string;
    customerCode: string;
    phone: string;
    address: string;
    manager:any;
    personals:any[];
    licenses:any[];
}


declare interface DeviceDTO {
    deviceCode:string;
    deviceSerial:string;
    deviceName:string;
    deviceType:number;
    active:boolean;
}
declare interface EmployeeDTO {
       
}
declare interface DepartmentDTO{

}
declare interface UserDTO{

}
declare interface UserGroupDTO{

}
declare interface RoleDTO{
    id:string;
    name:string;
    permissions:ITreeListNode[];
}