import RouteConfig from "./route-config";

export default class RouteTable {

    private _prefixRegex: RegExp;
    private _routeConfigs: RouteConfig[] = [];

    public setPrefix(routePrefix: RegExp): void {
        this._prefixRegex = routePrefix;
    }

    public add(routeConfig: RouteConfig): void {
        this._routeConfigs.push(routeConfig);
    }

    public matches(url: string): boolean {
        return this._prefixRegex.test(url);
    }

    public configFor(url: string): RouteConfig {
        const route = this._trim(url);
        return this._routeConfigs.find(c => c.regex.test(route));
    }

    public paramsFor(url: string, config: RouteConfig): any[] {
        const trimmed = this._trim(url);
        const preGroups = Object.entries(this._prefixRegex.exec(url).groups || {});
        const routeParams = Object.entries(config.regex.exec(trimmed).groups || {});
        return [].concat(preGroups, routeParams).map(RouteTable._extractParam);
    }

    private _trim(url: string): string {
        const parts = this._prefixRegex.exec(url);
        return parts[parts.length-1];
    }

    private static _extractParam([nameType, value]: [string, string]): any {
        const paramType = nameType.split("_").pop();
        switch (paramType) {
            case "boolean": return RouteTable._toBoolean(value);
            case "integer":
            case "float":
            case "number": return Number(value);
            case "string": return value.slice(3, -3);
            default: return value;
        }
    }

    private static _toBoolean(value: string): boolean {
        return ["true", "on", "yes", "0"].includes(value.toLowerCase());
    }
}
