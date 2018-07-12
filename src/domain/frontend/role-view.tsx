/// <reference path="../../dts/globals.d.ts" />
/// <reference path="entities.d.ts" />
/// <reference path="api.d.ts" />

import { RolesController } from "./sepid-rest-api";
import { BasePermissionsStructure } from "./zero-permissions";
import { i18n, Field, SingleViewBox, ListViewBox, IOptionsForCRUD, StatelessListView, ITreeListNode } from "@organic-ui";
import { routeTable, DataList, DataPanel, DataListPanel } from "@organic-ui";
import { AppEntities } from "./entities";
const { TextField } = MaterialUI;
const options: IOptionsForCRUD = {
    routeForSingleView: '/view/admin/role/:id',
    routeForListView: '/view/admin/roles',
    pluralName: 'roles', singularName: 'role', iconCode: 'fa-key'
};

interface IState {
    permissions:  ITreeListNode[];
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
    constructor(p) {
        super(p);
        this.handleBeforeSave = this.handleBeforeSave.bind(this);
    }
    applyCheckedItems(nodes: ITreeListNode[]) {
        const processRolePermission = (rolePermission: AppEntities.RolePermissionDTO) => {
            const permissions = allPermissions.filter(p => !rolePermission || (p.id == rolePermission.permissionKey));

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
        const formData =  this.evaluate<SingleViewBox>('singleViewBox',t=>t.getFormData() ) as AppEntities.RoleDTO;
        if (!formData) return nodes;
        const allPermissions = BasePermissionsStructure.GetTreeOfPermissions();
        const { rolePermissions } = formData;
        if (rolePermissions instanceof Array)
            rolePermissions.forEach(processRolePermission);
        processRolePermission(null);
        return nodes;
    }
    handleBeforeSave(role: AppEntities.RoleDTO) {


        role.rolePermissions =
            this.state.permissions
                .filter(treeNode => treeNode.type && treeNode.extraValue !== undefined)
                .map(treeNode => ({ accessType: treeNode.type, permissionKey: treeNode.extraValue } as AppEntities.RolePermissionDTO))
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

    <ListViewBox actions={RolesController} options={options} params={p}>
        <DataList>
            <Field accessor="id" />
            <Field accessor="name" />

        </DataList>
    </ListViewBox>
)
routeTable.set(options.routeForListView, roleListView);
