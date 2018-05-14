/// <reference path="../../platform.d.ts" />  
/// <reference path="../../core.d.ts" />
/// <reference path="entities.d.ts" />
/// <reference path="api.d.ts" />
const { Logic, routeTable } = Core;

class CustomerSingleView extends Core.ViewWithFluentAPI<any, CustomerAPI>
    implements ICRUDActionsForSingleView<CustomerDTO>{
    constructor(props) {
        super(props);

    }
    handleCreate = dto => this.api.createCustomer(dto);
    handleRead = id => this.api.findPersonById(id);
    handleUpdate = (dto, id) => this.api.updateCustomerById(dto, id);
    handleDelete = id => this.api.deleteCustomerById(id);
    renderContent() {
        return (<section className="view">
            ascascDDD
        </section>);
    }
}
Core.routeTable.set('/view/customer/:id', CustomerSingleView);
 