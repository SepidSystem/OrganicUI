/// <reference path="../../organicUI.d.ts" />
/// <reference path="entities.d.ts" />
/// <reference path="api.d.ts" />

import { RolesController } from "./sepid-rest-api";
import { BasePermissionsStructure } from "./zero-permissions";

const { Field, ObjectField, SingleViewBox, ListViewBox, Utils } = OrganicUI;
const { Spinner, routeTable, DataList, DataForm, DataPanel, DataListPanel } = OrganicUI;
const { TextField } = MaterialUI;

const { i18n } = OrganicUI;

//OrganicUI.routeTable.set('/view/customer/:id', CustomerView, { mode: 'single' });
const api = OrganicUI.remoteApi as RoleAPI;
const permissions: ITreeListNode[] = [
    { key: 1, parentKey: 0, text: 'permission1', type: 0 }
]

const options: IOptionsForCRUD = {
    routeForSingleView: '/view/admin/role/:id',
    routeForListView: '/view/admin/roles',
    pluralName: 'roles', singularName: 'role', iconCode: 'fa-key'
};

interface IState {
    permissions: ITreeListNode[];
}
const permissionPatterns =
{
    "": "^[A-Z]+$",
    "view-permission": "(.+)_DEFINE_READ",
    "create-permission": '^(.+)_DEFINE_CREATE$',
    "edit-permission": '^(.+)_DEFINE_UPDATE$',
    "delete-permission": '^(.+)_DEFINE_DELETE$'
}
interface IStateForSingleView {
    permissions: ITreeListNode[];
}
class SingleView extends OrganicUI.BaseComponent<any, IStateForSingleView>{

    refs: {
        singleViewBox: any;
    }
    constructor(p){
        super(p);
        this.handleBeforeSave=this.handleBeforeSave.bind(this); 
    }
    applyCheckedItems(nodes: ITreeListNode[]) {
        const processRolePermission = (rolePermission:RolePermissionDTO) => {
            const permissions = allPermissions.filter(p => !rolePermission || (p.id == rolePermission.permissionKey));
            console.log({permissions});
            debugger;
            nodes.forEach(node => {
                if (node.type == 1) return;
                const permissionKey: string = node.parentKey ? node.key : '';
                if (!permissionPatterns[permissionKey]) return false;

                const filterPermissions = permissions.filter(permission => {

                    const regExpr = new RegExp(permissionPatterns[permissionKey]);
                    let filtered: boolean = (node.parentKey || node.key).endsWith('/' + permission.key.split('_')[0].toLowerCase() + 's');
                    filtered = filtered && regExpr.test(permission.key);

                    return filtered;
                });
                node.type = (rolePermission && !!filterPermissions.length) ? (rolePermission.accessType) : 0;
                node.extraValue = filterPermissions[0] && filterPermissions[0].id;
                //       filterPermissions.length && console.log({ permissions, filterPermissions, node });
            });
        }
        const formData = this.refs.singleViewBox.getFormData() as RoleDTO;
        if (!formData) return nodes;
        const allPermissions = BasePermissionsStructure.GetTreeOfPermissions();
        const { rolePermissions } = formData;
        if (rolePermissions instanceof Array)
            rolePermissions.forEach(processRolePermission);
        else processRolePermission(null);
        return nodes;
    }
    handleBeforeSave(role: RoleDTO) {


        role.rolePermissions =
            this.state.permissions
                .filter(treeNode =>treeNode.type && treeNode.extraValue !== undefined)
                .map(treeNode => ({ accessType: treeNode.type, permissionKey: treeNode.extraValue } as RolePermissionDTO))
        return role;
    }
    render() {
        if (this.refs.singleViewBox) {
            this.state.permissions = this.state.permissions || OrganicUI.scanAllPermission(routeTable).then(r => this.applyCheckedItems(r)).then(permissions => this.repatch({ permissions })) as any;
        }
        else setTimeout(() => this.repatch({}), 100);
        return (<SingleViewBox params={this.props as any} actions={RolesController} customActions={{ handleBeforeSave: this.handleBeforeSave }} options={options} ref="singleViewBox">

            <DataPanel header={i18n("primary-fields")} primary className="half-column-fields" >
                <Field accessor="id" readonly>
                    <TextField type="text" />
                </Field>
                <Field accessor="name" required >
                    <TextField type="text" />
                </Field>

            </DataPanel>
            <DataPanel header="permissions"  >
                <Field accessor="permissions">
                    <OrganicUI.TreeList nodes={this.state.permissions} height={400} />
                </Field>
            </DataPanel>


        </SingleViewBox>);
    }
}
routeTable.set(options.routeForSingleView, SingleView);

export const roleListView: StatelessListView = p => (
    console.log({ p }),
    <ListViewBox actions={RolesController} options={options} params={p}>
        <DataList>
            <Field accessor="id" />
            <Field accessor="name" />

        </DataList>
    </ListViewBox>
)
routeTable.set(options.routeForListView, roleListView);
