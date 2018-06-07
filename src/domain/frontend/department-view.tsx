/// <reference path="../../organicUI.d.ts" />
/// <reference path="entities.d.ts" />
/// <reference path="api.d.ts" />

namespace LicApp.Frontend.Customer {
    const { Field, ObjectField, SingleViewBox, ListViewBox } = OrganicUI;
    const { routeTable, DataList, GridColumn, DataForm, DataPanel, DataListPanel } = OrganicUI;
    const { DetailsList, SelectionMode, TextField } = FabricUI;

    const { i18n } = OrganicUI;

    //OrganicUI.routeTable.set('/view/customer/:id', CustomerView, { mode: 'single' });
    const api = OrganicUI.remoteApi as DepartmentAPI;
    const actions: IActionsForCRUD<DepartmentDTO> = {
        handleCreate: dto => api.createDepartment(dto),
        handleRead: id => api.findEmployeeById(id), handleLoadData: params => api.readDepartmentList(params),
        handleUpdate: (id, dto) => api.updateDepartmentById(id, dto),
        handleDelete: id => api.deleteDepartmentById(id)
    };
    const crudOptions: ICRUDOptions = {
        routeForSingleView: '/view/admin/department/:id',
        routeForListView: '/view/admin/departments',
        
        pluralName: 'departments', singularName: "department", iconCode: 'fa-sitemap'
    }; 
    const singleView = (dataProps) =>
        (<SingleViewBox dataProps={dataProps} actions={actions} options={crudOptions} >

            <DataPanel header={i18n("primary-fields")} primary >
                <Field accessor="customerCode" required>
                    <TextField type="text" />
                </Field>
                <Field accessor="customerName" required >
                    <TextField type="text" />
                </Field>
                <Field accessor="phone" required>
                    <TextField type="text" />
                </Field>
                <Field accessor="address" required>
                    <TextField type="text" />
                </Field>
            </DataPanel>
            <DataListPanel formMode="callout" singularName="license" pluralName="licenses" accessor="licenses" selectionMode={SelectionMode.single}
            >
                <Field accessor="computerId" required >
                    <TextField type="text" />
                </Field>
                <Field accessor="licenseDate"  >
                    <TextField type="text" />
                </Field>
                <Field accessor="licenseCode" >
                    <TextField type="text" />
                </Field>
                <Field accessor="comment"  >
                    <TextField type="text" />
                </Field>
            </DataListPanel>
            <DataListPanel singularName="contact" pluralName="contacts" accessor="contacts" formMode="callout" selectionMode={SelectionMode.single} >
                <Field accessor="role"   >
                    <TextField type="text" />
                </Field>
                <Field accessor="fullName"   >
                    <TextField type="text" />
                </Field>
                <Field accessor="phone"   >
                    <TextField type="text" />
                </Field>
                <Field accessor="comment"  >
                    <TextField type="text" />
                </Field>
            </DataListPanel>

            <DataPanel header="payment-information">
                <Field accessor="paymentDate"    >
                    <TextField type="text" />
                </Field>
                <Field accessor="paymentStatus"    >
                    <TextField type="text" />
                </Field>
            </DataPanel>
        </SingleViewBox>);
    routeTable.set(crudOptions.routeForSingleView, singleView);

    const listView: StatelessListView = p => (
        <ListViewBox actions={actions} options={crudOptions} params={p}>
            <DataList>
                <GridColumn accessor="customerCode" />
                <GridColumn accessor="customerName" />
            </DataList>
        </ListViewBox>
    )
    routeTable.set( crudOptions.routeForListView, listView);

}