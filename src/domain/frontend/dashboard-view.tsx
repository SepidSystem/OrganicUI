/// <reference path="../../organicUI.d.ts" />
/// <reference path="entities.d.ts" />
/// <reference path="api.d.ts" />

 
namespace LicApp.Frontend.Customer {
    const { Field, ObjectField, SingleViewBox, ListViewBox ,DashboardBox} = OrganicUI;
    const { routeTable, DataList, GridColumn, DataForm, DataPanel, DataListPanel } = OrganicUI;
    const { DetailsList, SelectionMode, TextField } = FabricUI;

    const { i18n } = OrganicUI;

    //OrganicUI.routeTable.set('/view/customer/:id', CustomerView, { mode: 'single' });
    const api = OrganicUI.remoteApi as CustomerAPI;
    const actions: IActionsForCRUD<CustomerDTO> = {
        handleCreate: dto =>   api.createCustomer(dto),         
        handleRead: id => api.findCustomerById(id), handleLoadData: params => api.readCustomerList(params),
        handleUpdate: (id, dto) => api.updateCustomerById(id, dto),
        handleDelete: id => api.deleteCustomerById(id)
    }; 
    const dashboardView = (params) =>
        (<DashboardBox  actions={null} options={null} params={params} >
 
             
        </DashboardBox>);
    routeTable.set('/view/dashboard', dashboardView);
} 