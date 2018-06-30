/// <reference path="../../organicUI.d.ts" />
/// <reference path="entities.d.ts" />
/// <reference path="api.d.ts" />

import { EmployeesController } from "./sepid-rest-api";
import { EmployeeGenders } from "./zero-data-structures";
 

namespace EmployeeView {
    const { Field, ObjectField, SingleViewBox, ListViewBox } = OrganicUI;
    const { routeTable,ComboBox, DataList,   DataForm, DataPanel, DataListPanel } = OrganicUI;

    const { AppUtils } = OrganicUI;


    const { i18n } = OrganicUI;

    //OrganicUI.routeTable.set('/view/customer/:id', CustomerView, { mode: 'single' });
    const api = OrganicUI.remoteApi as EmployeeAPI;
     
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
        (<SingleViewBox params={params} actions={EmployeesController} options={options} >

            <DataPanel header="primary-fields" primary className="half-column-fields" >
                <Field accessor="active" required />
                <Field accessor="-" />
                <Field accessor="firstName" required />
                <Field accessor="lastName" required />
                <Field accessor="code" required />
                <Field accessor="nationalCode" required />
                <Field accessor="tel" required />
                <Field accessor="mobile" required />
                <Field accessor="email" required />
                <Field accessor="gender" required >
                    <ComboBox items={EmployeeGenders.Genders} />
                </Field>
                <Field accessor="startDate" required />
                <Field accessor="finishDate" required />
                <Field accessor="employmentStatus" required />
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
        <ListViewBox actions={EmployeesController} options={options} params={p}>
            <DataList>
                <Field accessor="id" />
                <Field accessor="customerName" onRenderCell={(item:EmployeeDTO)=>item.firstName + ' '+item.lastName} />
            </DataList>
        </ListViewBox>
    )
    routeTable.set(options.routeForListView, listView);

}