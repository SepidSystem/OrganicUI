/// <reference path="../../dts/globals.d.ts" />
/// <reference path="entities.d.ts" />
/// <reference path="api.d.ts" />

import { routeTable, DashboardBox } from "@organic-ui";

const dashboardView = (params) =>
    (<DashboardBox actions={null} options={null} params={params} >


    </DashboardBox>);
routeTable.set('/view/dashboard', dashboardView);
