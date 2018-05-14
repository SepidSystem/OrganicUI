/// <reference path="entities.d.ts" />
 
 
declare interface CustomerAPI {
    createCustomer(customer: CustomerDTO): ActionResult;
    readCustomerList(params): PromisedResultSet<CustomerDTO>, findCustomerById(id): Promise<CustomerDTO>;
    updateCustomerById(id,customer: CustomerDTO): ActionResult;
    deleteCustomerById(id): ActionResult;
}
 
declare interface SettingsAPI{

}

