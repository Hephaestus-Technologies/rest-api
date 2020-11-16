import {HttpVerb} from "./http-verb";
import RouteTable from "./route-table";
import RouteConfig from "./route-config";

const routeTables = {};

// noinspection JSUnusedGlobalSymbols
export const routePrefix = (routePrefix: string) => (Class) => {
    Class.prototype.routeTable.setPrefix(prefixRegexOf(routePrefix));
};

// noinspection JSUnusedGlobalSymbols
export const GET = (route: string) => (proto: any, propertyKey: string) => {
    proto.routeTable = proto.routeTable || new RouteTable()
    const table = proto.routeTable as RouteTable;
    const config = configOf(HttpVerb.HTTP_GET, route, propertyKey);
    table.add(config);
};

const configOf = (verb: HttpVerb, route: string, method: string): RouteConfig => {
    return {verb, regex: routeRegexOf(route), methodName: method};
};

const prefixRegexOf = (url: string): RegExp => {
    return new RegExp(`^/?${regexOf(url)}/?(.*)$`);
};

const routeRegexOf = (url: string): RegExp => {
    return new RegExp(`^/?${regexOf(url)}$`);
};

const regexOf = (url: string): string => {
    return  url.split("/")
        .filter(Boolean)
        .map(str => str[0] === ":" ? "([^/]+)" : str)
        .join("/");
};
