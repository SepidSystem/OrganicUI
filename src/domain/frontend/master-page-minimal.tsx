export const masterPage = p => <article className="blank minimal master-page">
    <OrganicUI.DeveloperBar />

    {p.children}
    <OrganicUI.AppUtils />
</article>;