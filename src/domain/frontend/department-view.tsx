/// <reference path="../../organicUI.d.ts" />
/// <reference path="entities.d.ts" />
/// <reference path="api.d.ts" />

 
    const { Field, ObjectField, SingleViewBox, ListViewBox } = OrganicUI;
    const { routeTable, DataList, GridColumn, DataForm, DataPanel, DataListPanel } = OrganicUI;
    const { DetailsList, SelectionMode, TextField } = FabricUI;

    const { i18n } = OrganicUI;

    //OrganicUI.routeTable.set('/view/customer/:id', CustomerView, { mode: 'single' });
    const api = OrganicUI.remoteApi as DepartmentAPI;
    const actions: IActionsForCRUD<DepartmentDTO> = {
        handleCreate: dto => api.createDepartment(dto),
        handleRead: id => api.findDepartmentById(id), handleLoadData: params => api.readDepartmentList(params),
        handleUpdate: (id, dto) => api.updateDepartmentById(id, dto),
        handleDelete: id => api.deleteDepartmentById(id)
    };
    const options: IOptionsForCRUD = {
        routeForSingleView: '/view/admin/department/:id',
        routeForListView: '/view/admin/departments',
        pluralName: 'departments', singularName: "department", iconCode: 'fa-sitemap'
        
    };
    const singleView: StatelessSingleView = params =>
        (<SingleViewBox params={params} actions={actions} options={options} >

            <DataPanel header={i18n("primary-fields")} primary  className="medium-fields">
                <Field accessor="id" readonly>
                    <TextField type="text" />
                </Field>
                <Field accessor="departmentName" required >
                    <TextField type="text" />
                </Field>
               
            </DataPanel>
            
        </SingleViewBox>);
    routeTable.set(options.routeForSingleView, singleView);

    export const departmentListView: StatelessListView = p => (
        <ListViewBox actions={actions} options={options} params={p}>
            <DataList>
                {!p.forDataLookup && <GridColumn accessor="id" />}
                <GridColumn accessor="departmentName" />
            </DataList>
        </ListViewBox>
    )
    routeTable.set(options.routeForListView, departmentListView);

