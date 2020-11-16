import RouteConfig from "./route-config";

export default class RouteTable {

    private _prefixRegex: RegExp;
    private _routeConfigs: RouteConfig[] = [];

    public setPrefix(routePrefix: RegExp) {
        this._prefixRegex = routePrefix;
    }

    public add(routeConfig: RouteConfig) {
        this._routeConfigs.push(routeConfig);
    }

    public matches(url: string) {
        return this._prefixRegex.test(url);
    }

    public configFor(url: string): RouteConfig {
        const route = this._trim(url);
        return this._routeConfigs.find(c => c.regex.test(route));
    }

    private _trim(url: string): string {
        const parts = this._prefixRegex.exec(url);
        return parts[parts.length-1];
    }

    paramsFor(url: string, config: RouteConfig): string[] {
        const trimmed = this._trim(url);
        const preParams = this._prefixRegex.exec(url).slice(1, -1);
        const routeParams = config.regex.exec(trimmed).slice(1);
        return [].concat(preParams, routeParams);
    }
}
