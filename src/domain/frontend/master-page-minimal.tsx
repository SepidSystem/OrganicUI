import { AppUtils, DeveloperBar } from "@organic-ui";

export const masterPage = p => <article className="blank minimal master-page">
    <DeveloperBar />

    {p.children}
    <AppUtils />
</article>;