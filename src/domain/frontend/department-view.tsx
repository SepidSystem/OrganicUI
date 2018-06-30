/// <reference path="../../organicUI.d.ts" />
/// <reference path="entities.d.ts" />
/// <reference path="api.d.ts" />

import { DepartmentsController } from "./sepid-rest-api";


const { Field, ObjectField, SingleViewBox, ListViewBox } = OrganicUI;
const { routeTable, DataList, DataForm, DataPanel, DataListPanel } = OrganicUI;
const { DetailsList, SelectionMode, TextField } = FabricUI;

const { i18n } = OrganicUI;

//OrganicUI.routeTable.set('/view/customer/:id', CustomerView, { mode: 'single' });
const api = OrganicUI.remoteApi as DepartmentAPI;
const actions: IActionsForCRUD<DepartmentDTO> = {
    handleCreate: dto => api.createDepartment(dto),
    handleRead: id => api.findDepartmentById(id), handleReadList: params => api.readDepartmentList(params),
    handleUpdate: (id, dto) => api.updateDepartmentById(id, dto),
    handleDeleteList: id => api.deleteDepartmentById(id),
    getText: dto => dto.departmentName,
};
const options: IOptionsForCRUD = {
    routeForSingleView: '/view/admin/department/:id',
    routeForListView: '/view/admin/departments',
    pluralName: 'departments', singularName: "department", iconCode: 'fa-sitemap'

};
const singleView: StatelessSingleView = params =>
    (<SingleViewBox params={params} actions={DepartmentsController} options={options} >

        <DataPanel header={i18n("primary-fields")} primary className="medium-fields">
            <Field accessor="id" readonly />
            <Field accessor="name" required />
            <Field accessor="description" required />
        </DataPanel>

    </SingleViewBox>);
routeTable.set(options.routeForSingleView, singleView);

export const departmentListView: StatelessListView = p => (
    <ListViewBox actions={DepartmentsController} options={options} params={p}>
        <DataList>
            {!p.forDataLookup && <Field accessor="id" />}
            <Field accessor="name" />
        </DataList>
    </ListViewBox>
)
routeTable.set(options.routeForListView, departmentListView);

