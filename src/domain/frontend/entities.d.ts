

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