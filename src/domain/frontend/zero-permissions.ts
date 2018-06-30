
export class BasePermissionsStructure {
  
    public static DEPARTMENT_DEFINE_CREATE = 1100;
    public static DEPARTMENT_DEFINE_READ = 1101;
    public static DEPARTMENT_DEFINE_UPDATE = 1102;
    public static DEPARTMENT_DEFINE_DELETE = 1103;

    public static DEVICE_DEFINE_CREATE = 1200;
    public static DEVICE_DEFINE_READ = 1201;
    public static DEVICE_DEFINE_UPDATE = 1202;
    public static DEVICE_DEFINE_DELETE = 1203;

    public static DEVICE_SCAN_CARD = 1210;
    public static DEVICE_SCAN_FINGER = 1211;

    public static MONITORING_ATTENDANCE = 1310;

    public static REGIONALDIV_DEFINE_CREATE = 1400;
    public static REGIONALDIV_DEFINE_READ = 1401;
    public static REGIONALDIV_DEFINE_UPDATE = 1402;
    public static REGIONALDIV_DEFINE_DELETE = 1403;

    public static USER_DEFINE_CREATE = 1500;
    public static USER_DEFINE_READ = 1501;
    public static USER_DEFINE_UPDATE = 1502;
    public static USER_DEFINE_DELETE = 1503;

    public static DATAITEMGROUP_DEFINE_CREATE = 1600;
    public static DATAITEMGROUP_DEFINE_READ = 1601;
    public static DATAITEMGROUP_DEFINE_UPDATE = 1602;
    public static DATAITEMGROUP_DEFINE_DELETE = 1603;

    public static ROLE_DEFINE_CREATE = 1700;
    public static ROLE_DEFINE_READ = 1701;
    public static ROLE_DEFINE_UPDATE = 1702;
    public static ROLE_DEFINE_DELETE = 1703;

    
    public static GetTreeOfPermissions() {

        return [
            { key: 'FULL_ACCESS', isPermission: false, id: 1, text: 'دسترسی کامل', parentId: 0 },

            { key: 'DEPARTMENT', isPermission: false, id: 103, text: 'دپارتمان', parentId: 1 },
            { key: 'DEPARTMENT_DEFINE_CREATE', isPermission: true, id: 1100, text: 'افزودن دپارتمان', parentId: 103 },
            { key: 'DEPARTMENT_DEFINE_READ', isPermission: true, id: 1101, text: 'خواندن دپارتمان', parentId: 103 },
            { key: 'DEPARTMENT_DEFINE_UPDATE', isPermission: true, id: 1102, text: 'ویرایش دپارتمان', parentId: 103 },
            { key: 'DEPARTMENT_DEFINE_DELETE', isPermission: true, id: 1103, text: 'حذف دپارتمان', parentId: 103 },

            { key: 'DEVICE', isPermission: false, id: 104, text: 'دستگاه', parentId: 1 },
            { key: 'DEVICE_DEFINE_CREATE', isPermission: true, id: BasePermissionsStructure.DEVICE_DEFINE_CREATE, text: 'افزودن دستگاه', parentId: 104 },
            { key: 'DEVICE_DEFINE_READ', isPermission: true, id: BasePermissionsStructure.DEVICE_DEFINE_READ, text: 'خواندن دستگاه', parentId: 104 },
            { key: 'DEVICE_DEFINE_UPDATE', isPermission: true, id: BasePermissionsStructure.DEVICE_DEFINE_UPDATE, text: 'ویرایش دستگاه', parentId: 104 },
            { key: 'DEVICE_DEFINE_DELETE', isPermission: true, id: BasePermissionsStructure.DEVICE_DEFINE_DELETE, text: 'حذف دستگاه', parentId: 104 },
            { key: 'DEVICE_SCAN_CARD', isPermission: true, id: BasePermissionsStructure.DEVICE_SCAN_CARD, text: 'اسکن کارت', parentId: 4 },
            { key: 'DEVICE_SCAN_FINGER', isPermission: true, id: BasePermissionsStructure.DEVICE_SCAN_FINGER, text: 'اسکن انگشت', parentId: 104 },

            { key: 'REGIONALDIV', isPermission: false, id: 106, text: 'ناحیه', parentId: 1 },
            { key: 'REGIONALDIV_DEFINE_CREATE', isPermission: true, id: 1400, text: 'افزودن ناحیه', parentId: 106 },
            { key: 'REGIONALDIV_DEFINE_READ', isPermission: true, id: 1401, text: 'خواندن ناحیه', parentId: 106 },
            { key: 'REGIONALDIV_DEFINE_UPDATE', isPermission: true, id: 1402, text: 'ویرایش ناحیه', parentId: 106 },
            { key: 'REGIONALDIV_DEFINE_DELETE', isPermission: true, id: 1403, text: 'حذف ناحیه', parentId: 106 },

            { key: 'USER', isPermission: false, id: 107, text: 'کاربر', parentId: 1 },
            { key: 'USER_DEFINE_CREATE', isPermission: true, id: BasePermissionsStructure.USER_DEFINE_CREATE, text: 'افزودن کاربر', parentId: 107 },
            { key: 'USER_DEFINE_READ', isPermission: true, id: BasePermissionsStructure.USER_DEFINE_READ, text: 'خواندن کاربر', parentId: 107 },
            { key: 'USER_DEFINE_UPDATE', isPermission: true, id: BasePermissionsStructure.USER_DEFINE_UPDATE, text: 'ویرایش کاربر', parentId: 107 },
            { key: 'USER_DEFINE_DELETE', isPermission: true, id: BasePermissionsStructure.USER_DEFINE_DELETE, text: 'حذف کاربر', parentId: 107 },

            { key: 'DATAITEMGROUP', isPermission: false, id: 108, text: 'اقلام داده', parentId: 1 },
            { key: 'DATAITEMGROUP_DEFINE_CREATE', isPermission: true, id: 1600, text: 'افزودن کاربر', parentId: 108 },
            { key: 'DATAITEMGROUP_DEFINE_READ', isPermission: true, id: 1601, text: 'خواندن کاربر', parentId: 108 },
            { key: 'DATAITEMGROUP_DEFINE_UPDATE', isPermission: true, id: 1602, text: 'ویرایش کاربر', parentId: 108 },
            { key: 'DATAITEMGROUP_DEFINE_DELETE', isPermission: true, id: 1603, text: 'حذف کاربر', parentId: 108 },

            { key: 'ROLE', isPermission: false, id: 109, text: 'نقش', parentId: 1 },
            { key: 'ROLE_DEFINE_CREATE', isPermission: true, id: BasePermissionsStructure.ROLE_DEFINE_CREATE, text: 'افزودن نقش', parentId: 109 },
            { key: 'ROLE_DEFINE_READ', isPermission: true, id: BasePermissionsStructure.ROLE_DEFINE_READ, text: 'خواندن نقش', parentId: 109 },
            { key: 'ROLE_DEFINE_UPDATE', isPermission: true, id: BasePermissionsStructure.ROLE_DEFINE_UPDATE, text: 'ویرایش نقش', parentId: 109 },
            { key: 'ROLE_DEFINE_DELETE', isPermission: true, id: BasePermissionsStructure.ROLE_DEFINE_DELETE, text: 'حذف نقش', parentId: 109 },
          
        ];
    }
    
}










// // ************** Menu Items ****************
// import { Menu } from '../theme/components/menu/menu.model';
// export const MenuItems = [
//     {
//         OrRoleIDs: [],
//         AndRoleIDs: [],
//         Menu: new Menu(0, 'داشبورد', '/pages/dashboard', null, 'tachometer', null, false, 0)
//     },
//     {
//         OrRoleIDs: [],
//         AndRoleIDs: [PermissionsStructure.EMPLOYEE_DEFINE_READ],
//         Menu: new Menu(10, 'پرسنل', '/pages/admin/employees', null, 'user', null, false, 0)
//     },
//     {
//         OrRoleIDs: [],
//         AndRoleIDs: [PermissionsStructure.DEPARTMENT_DEFINE_READ],
//         Menu: new Menu(20, 'دپارتمان ها', '/pages/admin/departments', null, 'sitemap', null, false, 0)
//     },
//     {
//         OrRoleIDs: [],
//         AndRoleIDs: [PermissionsStructure.DEVICE_DEFINE_READ],
//         Menu: new Menu(30, 'دستگاه ها', '/pages/admin/devices', null, 'calculator', null, false, 0)
//     },
//     {
//         OrRoleIDs: [
//             PermissionsStructure.USER_DEFINE_READ,
//             PermissionsStructure.ROLE_DEFINE_READ,
//             PermissionsStructure.DATAITEMGROUP_DEFINE_READ
//         ],
//         AndRoleIDs: [],
//         Menu: new Menu(40, 'مدیریت دسترسی ها', null, null, 'lock', null, true, 0)
//     },
//     {
//         OrRoleIDs: [],
//         AndRoleIDs: [PermissionsStructure.USER_DEFINE_READ],
//         Menu: new Menu(50, 'کاربران', '/pages/admin/users', null, 'user-circle', null, false, 40)
//     },
//     {
//         OrRoleIDs: [],
//         AndRoleIDs: [PermissionsStructure.USER_DEFINE_READ],
//         Menu: new Menu(51, 'گروه‌های کاربران', '/pages/admin/usergroups', null, 'users', null, false, 40)
//     },
//     {
//         OrRoleIDs: [],
//         AndRoleIDs: [PermissionsStructure.ROLE_DEFINE_READ],
//         Menu: new Menu(60, 'نقش ها', '/pages/admin/roles', null, 'key', null, false, 40)
//     },
//     {
//         OrRoleIDs: [],
//         AndRoleIDs: [PermissionsStructure.DATAITEMGROUP_DEFINE_READ],
//         Menu: new Menu(70, 'گروه اقلام داده', '/pages/admin/dataitemgroups', null, 'stack-overflow', null, false, 40)
//     },
//     {
//         OrRoleIDs: [PermissionsStructure.MONITORING_ATTENDANCE],
//         AndRoleIDs: [],
//         Menu: new Menu(80, 'گزارش‌ها', null, null, 'line-chart', null, true, 0)
//     },
//     {
//         OrRoleIDs: [],
//         AndRoleIDs: [PermissionsStructure.MONITORING_ATTENDANCE],
//         Menu: new Menu(90, 'مانیتورینگ تردد', '/pages/admin/reports/attendancelive', null, 'car', null, false, 80)
//     },
//     {
//         OrRoleIDs: [],
//         AndRoleIDs: [PermissionsStructure.MONITORING_ATTENDANCE],
//         Menu: new Menu(100, 'گزارش تردد ', '/pages/admin/reports/attendance', null, 'id-card-o', null, false, 80)
//     },
//     {
//         OrRoleIDs: [],
//         AndRoleIDs: [PermissionsStructure.MONITORING_ATTENDANCE],
//         Menu: new Menu(110, 'گزارش سنجه‌های هویتی', '/pages/admin/reports/employeetemplates', null, 'id-card-o', null, false, 80)
//     }
// ]
