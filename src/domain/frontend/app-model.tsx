import { DefaultMasterPage } from "./master-page";

import { Menu, i18n, IAppModel } from '@organic-ui';
export default class AppModel implements IAppModel {

    getMenuItems() {
        return [
            {
                // OrRoleIDs: [],
                // AndRoleIDs: [],
                menu: new Menu(0, 'داشبورد', '/view/dashboard', null, 'fa-tachometer', null, false, 0)
            },
            {
                // OrRoleIDs: [],
                // AndRoleIDs: [PermissionsStructure.EMPLOYEE_DEFINE_READ],
                menu: new Menu(10, 'پرسنل', '/view/admin/employees', null, 'fa-user', null, false, 0)
            },
            {
                // OrRoleIDs: [],
                // AndRoleIDs: [BasePermissionsStructure.DEPARTMENT_DEFINE_READ],
                menu: new Menu(20, 'دپارتمان ها', '/view/admin/departments', null, 'fa-sitemap', null, false, 0)
            },
            {
                // OrRoleIDs: [],
                // AndRoleIDs: [BasePermissionsStructure.DEVICE_DEFINE_READ],
                menu: new Menu(30, 'دستگاه ها', '/view/admin/devices', null, 'fa-calculator', null, false, 0)
            }, {
                menu: new Menu(1000, 'مدیریت دسترسی', null, null, 'fa-lock', null, true, 0)
            },
            {
                menu: new Menu(1001, 'زمان بندی', '/view/admin/schedules', null, 'fa-lock', null, false, 1000)
            }, {
                menu: new Menu(1002, 'گروه دسترسی', '/view/admin/access-groups', null, 'fa-access', null, false, 1000)
            },
            {
                // OrRoleIDs: [],
                // AndRoleIDs: [BasePermissionsStructure.DEVICE_DEFINE_READ],
                menu: new Menu(35, 'عملیات دستگاه', null, null, 'fa-server', null, true, 0)
            },
            {
                // OrRoleIDs: [],
                // AndRoleIDs: [BasePermissionsStructure.DEVICE_DEFINE_READ],
                menu: new Menu(37, 'انتقال دیتابیس به دستگاه', '/view/admin/device-employees', null, 'fa-arrow-left', null, false, 35)
            },
            {
                // OrRoleIDs: [],
                // AndRoleIDs: [BasePermissionsStructure.DEVICE_DEFINE_READ],
                menu: new Menu(38, 'انتقال دستگاه به دیتابیس', '/view/admin/device-users', null, 'fa-arrow-right', null, false, 35)
            },
            {
                // OrRoleIDs: [],
                // AndRoleIDs: [BasePermissionsStructure.DEVICE_DEFINE_READ],
                menu: new Menu(39, 'خواندن ساعت', '/view/admin/device-times', null, 'fa-hourglass', null, false, 35)
            },
            {
                // OrRoleIDs: [    BasePermissionsStructure.USER_DEFINE_READ,  BasePermissionsStructure.ROLE_DEFINE_READ,BasePermissionsStructure.DATAITEMGROUP_DEFINE_READ],
                // AndRoleIDs: [],
                menu: new Menu(40, 'مدیریت دسترسی ها', null, null, 'fa-lock', null, true, 0)
            },
            {
                // OrRoleIDs: [],
                // AndRoleIDs: [BasePermissionsStructure.USER_DEFINE_READ],
                menu: new Menu(50, 'کاربران', '/view/admin/users', null, 'fa-user-circle', null, false, 40)
            },
            {
                // OrRoleIDs: [],
                // AndRoleIDs: [BasePermissionsStructure.USER_DEFINE_READ],
                menu: new Menu(51, 'گروه‌های کاربران', '/view/admin/usergroups', null, 'fa-users', null, false, 40)
            },
            {
                // OrRoleIDs: [],
                // AndRoleIDs: [BasePermissionsStructure.ROLE_DEFINE_READ],
                menu: new Menu(60, 'نقش ها', '/view/admin/roles', null, 'fa-key', null, false, 40)
            },
            {
                // OrRoleIDs: [],
                // AndRoleIDs: [BasePermissionsStructure.DATAITEMGROUP_DEFINE_READ],
                menu: new Menu(70, 'گروه اقلام داده', '/view/admin/data-item-groups', null, 'fa-stack-overflow', null, false, 40)
            },
            {
                // OrRoleIDs: [BasePermissionsStructure.MONITORING_ATTENDANCE],
                // AndRoleIDs: [],
                menu: new Menu(80, 'گزارش‌ها', null, null, 'fa-line-chart', null, true, 0)
            },
            {
                // OrRoleIDs: [],
                // AndRoleIDs: [BasePermissionsStructure.MONITORING_ATTENDANCE],
                menu: new Menu(90, 'مانیتورینگ تردد', '/view/admin/reports/attendancelive', null, 'fa-car', null, false, 80)
            },
            {
                // OrRoleIDs: [],
                // AndRoleIDs: [BasePermissionsStructure.MONITORING_ATTENDANCE],
                menu: new Menu(100, 'گزارش تردد ', '/view/admin/reports/attendance', null, 'fa-id-card-o', null, false, 80)
            },
            {
                // OrRoleIDs: [],
                // AndRoleIDs: [PermissionsStructure.MONITORING_ATTENDANCE],
                menu: new Menu(110, 'گزارش سنجه‌های هویتی', '/view/admin/reports/employeetemplates', null, 'fa-id-card-o', null, false, 80)
            },
            {
                // OrRoleIDs: [],
                // AndRoleIDs: [PermissionsStructure.MONITORING_ATTENDANCE],
                menu: new Menu(120, 'گزارش وقایع', '/view/admin/reports/eventlogs', null, 'fa-id-card-o', null, false, 80)
            }
        ];

    }
    defaultMasterPage() {
        return DefaultMasterPage;
    }
}