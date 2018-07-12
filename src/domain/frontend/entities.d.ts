/// <reference path="../../dts/globals.d.ts" />
/// <reference path="../../dts/organic-ui.d.ts" />

import { ITreeListNode } from "@organic-ui";

declare namespace AppEntities {
    export interface CustomerDTO {
        customerName: string;
        customerCode: string;
        phone: string;
        address: string;
        manager: any;
        personals: any[];
        licenses: any[];
    }


    export interface DeviceDTO {
        id: number;
        code: string;
        model: number;
        modelStr: string;
        matchingMode: number;
        entranceMode: number;
        name: string;
        serial: string;
        active: number;
        ip: string;
        port: string;
        timeZone: string;
        gateway: string;
        subnet: string;
        firmewareVersion: string;
        enableDaylightSync: boolean;
        departmentId: number;
        useDhcp: boolean;
        syncTimeByServer: boolean;
        syncLog: boolean;
        syncTasks: boolean;
        syncLogPeriod: string;
        syncLogStartDate: string;
        authenticationMode: number;
        connectionStatusStr: string;
    }
    export interface EmployeeDTO {
        firstName: string;
        lastName: string;
    }
    export interface DepartmentDTO {
        departmentName: string;
        subDepartments: DepartmentDTO[];
    }
    export interface UserDTO {
        id: number;
        username: string;
        password: string;
        confirmPassword: string;
        active: boolean;
        fullName: string;
        rolesIds: number[];
        dataItemGroupIds: number[];
    }
    export interface UserGroupDTO {

    }
    export interface RolePermissionDTO { accessType, permissionKey }
    export interface RoleDTO {
        id: string;
        name: string;
        permissions: ITreeListNode[];
        rolePermissions: RolePermissionDTO[];
    }
    export enum ScheduleType {
        weekly = 1,
        daily = 2
    }
    export interface ScheduleDTO {
        id?: number;
        name: string;
        description: string;
        type: number;
        cycle: number;
        scheduleShifts: { id, dayNumber, startTime, endTime }[];
    }

}
