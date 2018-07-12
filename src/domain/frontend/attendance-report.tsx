/// <reference path="../../dts/globals.d.ts" />
/// <reference path="entities.d.ts" />
/// <reference path="api.d.ts" />


import { routeTable,ReportViewBox } from "@organic-ui";

const reportView = (params) =>
    (<ReportViewBox actions={null} options={null} params={null} >


    </ReportViewBox>);
routeTable.set('/view/admin/reports/attendance', reportView);
