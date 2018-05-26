import { registryFactory } from "./registry-factory";

export const routes = [];
export const routeTable = registryFactory<any>();
export function route(path: string, args: Object): typeof React.Component {
    const match = (route: string) => {
        let pattern = route;
        const parameters = [];

        while (/[:]([a-zA-Z0-9]+)/.test(pattern)) {
            pattern = pattern.replace(/[:]([a-zA-Z0-9]+)/, s => (parameters.push(s.substr(1)), '([^/]+)'))
        }
        path.split('/').filter(c => c.includes(':')).forEach(c => {
            const [key, value] = c.split(':');
            if (args[key] instanceof Array)
                args[key].push(value);
            else if (args[key])
                args[key] = [args[key], value];
            else
                args[key] = value;
        });
        const regExpr = new RegExp('^' + pattern + '$');
        const m = path.split('/').filter(c => !c.includes(':')).join('/').match(regExpr);
        if (m) {

            for (let idx = 1; idx < m.length; idx++) {
                const paramName = parameters.shift();

                const value = m[idx];
                if (paramName in args) {

                    args[paramName] = args[paramName] instanceof Array ? args[paramName].concat([value]) : [args[paramName], value];
                }
                else
                    args[paramName] = value;

            }
            return true;
        }
        return null;
    }

    const matchedRoutes = Object.keys(routeTable.data).filter(match);

    const lastSecondaryValue = matchedRoutes.map(key => routeTable.secondaryValues[key])[0]
    Object.assign(route, { lastSecondaryValue });
    if (matchedRoutes.length == 1) return matchedRoutes.map(routeTable)[0];
    console.warn({ matchedRoutes });
}
Object.assign(route, { lastSecondaryValue: null });