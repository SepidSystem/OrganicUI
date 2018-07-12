import { webApi } from "./sepid-rest-api";
import { IAdvancedQueryFilters } from "@organic-ui";

const customMapProps = {
    startFrom: '_start',
    rowCount: '_limit'

}
OrganicUI.refetch['bodyMapper'] = ({ url, method, body }) => {
    if (method != 'GET' || !body) return body;
    for (var key in customMapProps) {
        if (body[key] === undefined) continue;
        body[customMapProps[key]] = body[key];
        delete body[key];

    }
    return body;
}
webApi['bodyMapper'] = ({ url, method, body }) => {
    if (body && 'startFrom' in body && 'rowCount' in body) {
        const result = {
            fromRowIndex: body.startFrom,
            toRowIndex: body.rowCount + body.startFrom,
            filterModel: body.filterModel ||  body.filters || []
        } as Partial<IAdvancedQueryFilters>;
        delete body.startFrom;
        delete body.rowCount;
        delete body.filters;
        return Object.assign(result, body);
    }
    return body;
}