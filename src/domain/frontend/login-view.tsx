
namespace LoginView {
    const masterPage = p => <article className="blank">
    <OrganicUI.DeveloperBar />
    
    {p.children}
    <OrganicUI.AppUtils />
    </article>;
    const { ViewBox, routeTable,DataForm,Field } = OrganicUI;
    const loginView = p => (
        <ViewBox options={{ className:'login-nox' }} params={p} actions={{}}>
            <DataForm  className="login-box">
                <Field accessor="userName" />
                <Field accessor="passWord" />
            </DataForm>
        </ViewBox>
    )
    Object.assign(loginView, { masterPage });
    routeTable.set('/view/auth/login', loginView);
}