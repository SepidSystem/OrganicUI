  
OrganicUI.devTools.set('SingleView|Actions', (target, devPort) => {
    devPort.devElement = (<section className="dev-sheet">
        <h2 className="title is-5">Action for Create</h2>

        <h2 className="title is-5">Action for Read</h2>
        <h2 className="title is-5">Action for Update</h2>
        <h2 className="title is-5">Action for Delete</h2>
   </section>);
    setTimeout(() => devPort.setState({}), 100);
});
OrganicUI.devTools.set('SingleView|Logs', (target, devPort) => {
    devPort.devElement = (<section className="dev-sheet">
        <h2 className="title is-6">Log1</h2>
 
   </section>);
    setTimeout(() => devPort.setState({}), 100);
});