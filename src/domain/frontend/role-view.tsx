/// <reference path="../../organicUI.d.ts" />
/// <reference path="entities.d.ts" />
/// <reference path="api.d.ts" />


const { Field, ObjectField, SingleViewBox, ListViewBox } = OrganicUI;
const { routeTable, DataList,   DataForm, DataPanel, DataListPanel } = OrganicUI;
const { TextField } = MaterialUI;

const { i18n } = OrganicUI;

//OrganicUI.routeTable.set('/view/customer/:id', CustomerView, { mode: 'single' });
const api = OrganicUI.remoteApi as RoleAPI;
const permissions: ITreeListNode[] = [
    { key: 1, parentKey: 0, text: 'permission1', type: 0 }
]
const actions: IActionsForCRUD<RoleDTO> = {
    handleCreate: dto => api.createRole(dto),
    handleRead: id => api.findRoleById(id),
    mapFormData: dto => Object.assign(dto, { permissions: OrganicUI.scanAllPermission(routeTable) }),
    handleLoadData: params => api.readRoleList(params),
    handleUpdate: (id, dto) => api.updateRoleById(id, dto),
    handleDelete: id => api.deleteRoleById(id),
    getText: dto => dto.name

};
const options: IOptionsForCRUD = {
    routeForSingleView: '/view/admin/role/:id',
    routeForListView: '/view/admin/roles',
    pluralName: 'roles', singularName: 'role', iconCode: 'fa-key'
};

const singleView: StatelessSingleView = params =>
    (<SingleViewBox params={params} actions={actions} options={options}>

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
                <OrganicUI.TreeList height={400} />
            </Field>
        </DataPanel>


    </SingleViewBox>);
routeTable.set('/view/admin/role/:id', singleView);

export const roleListView: StatelessListView = p => (
    <ListViewBox actions={actions} options={options} params={p}>
        <DataList>
            <Field accessor="id" />
            <Field accessor="name" />

        </DataList>
    </ListViewBox>
)
routeTable.set('/view/admin/roles', roleListView);
