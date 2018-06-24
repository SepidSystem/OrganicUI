/// <reference path="../../organicUI.d.ts" />
/// <reference path="entities.d.ts" />
/// <reference path="api.d.ts" />

namespace EmployeeView {
    const { Field, ObjectField, SingleViewBox, ListViewBox } = OrganicUI;
    const { routeTable, DataList,   DataForm, DataPanel, DataListPanel } = OrganicUI;

    const { AppUtils } = OrganicUI;


    const { i18n } = OrganicUI;

    //OrganicUI.routeTable.set('/view/customer/:id', CustomerView, { mode: 'single' });
    const api = OrganicUI.remoteApi as EmployeeAPI;
    const actions: IActionsForCRUD<EmployeeDTO> = {
        handleCreate: dto => api.createEmployee(dto),
        handleRead: id => api.findEmployeeById(id), handleReadList: params => api.readEmployeeList(params),
        handleUpdate: (id, dto) => api.updateEmployeeById(id, dto),
        handleDeleteList: id => api.deleteEmployeeById(id)
    };
    const options: IOptionsForCRUD = {
        routeForSingleView: '/view/admin/employee/:id',
        routeForListView: '/view/admin/employees',
        pluralName: "employees", singularName: "employee", iconCode: 'fa-user'
    };
    function handleGroupedFingerPrint() {
        return AppUtils.showDataDialog(<DataForm>
            <Field accessor="enrollmentTemplateType" />
            <Field accessor="enrollmentTemplateNumber" />
            <Field accessor="thumbData" />
            <Field accessor="vehicleModel" />
        </DataForm>);
    }
    function handleFingerPrint() {
        return AppUtils.showDataDialog(<DataForm>
            <Field accessor="enrollmentTemplateType" />
            <Field accessor="enrollmentTemplateNumber" />
            <Field accessor="thumbData" />
            <Field accessor="vehicleModel" />
        </DataForm>);
    }
    function handleFace() {
        return AppUtils.showDataDialog(<DataForm>
            <Field accessor="enrollmentTemplateType" />
            <Field accessor="enrollmentTemplateNumber" />
            <Field accessor="thumbData" />
            <Field accessor="vehicleModel" />
        </DataForm>);
    }
    function handleCard() {
        return AppUtils.showDataDialog(<DataForm>
            <Field accessor="enrollmentTemplateType" />
            <Field accessor="enrollmentTemplateNumber" />
            <Field accessor="thumbData" />
            <Field accessor="vehicleModel" />
        </DataForm>);
    }
    function handlePlate() {
        return AppUtils.showDataDialog(<DataForm>
            <Field accessor="enrollmentTemplateType" />
            <Field accessor="enrollmentTemplateNumber" />
            <Field accessor="thumbData" />
            <Field accessor="vehicleModel" />
        </DataForm>);
    }
    const singleView: StatelessSingleView = params =>
        (<SingleViewBox params={params} actions={actions} options={options} >

            <DataPanel header="primary-fields" primary className="half-column-fields" >
                <Field accessor="isActive" required />
                <Field accessor="-" />
                <Field accessor="FirstName" required />
                <Field accessor="LastName" required />
                <Field accessor="Code" required />
                <Field accessor="NationalCode" required />
                <Field accessor="Tel" required />
                <Field accessor="Mobile" required />
                <Field accessor="Email" required />
                <Field accessor="Gender" required />
                <Field accessor="StartDate" required />
                <Field accessor="FinishDate" required />
                <Field accessor="EmploymentStatus" required />
            </DataPanel>
            <DataPanel header="locations" className="half-column-fields">
                <Field accessor="DepartmentId" required />
                <Field accessor="DeviceIds" required />
            </DataPanel>
            <DataListPanel header="templates" customBar={{ handleGroupedFingerPrint, handleFingerPrint, handleFace, handleCard, handlePlate }}>
                <Field accessor="enrollmentTemplateType" required />
                <Field accessor="enrollmentTemplateNumber" required />
                <Field accessor="thumbData" required />
                <Field accessor="vehicleModel" required />

            </DataListPanel>
        </SingleViewBox>);
    routeTable.set(options.routeForSingleView, singleView);

    const listView: StatelessListView = p => (
        <ListViewBox actions={actions} options={options} params={p}>
            <DataList>
                <Field accessor="id" />
                <Field accessor="customerName" />
            </DataList>
        </ListViewBox>
    )
    routeTable.set(options.routeForListView, listView);

}