import {HttpVerb} from "./http-verb";
import RouteTable from "./route-table";

const registerRoute = (verb: HttpVerb) => (route: string) => (proto: any, methodName: string): void => {
    proto.__routeTable__ = proto.__routeTable__ || emptyTable();
    const table = proto.__routeTable__ as RouteTable;
    route = route.split("/").filter(Boolean).join("/");
    table.configs.push({verb, route, methodName});
};

// noinspection JSUnusedGlobalSymbols
export const HEAD = registerRoute(HttpVerb.HTTP_HEAD);

// noinspection JSUnusedGlobalSymbols
export const GET = registerRoute(HttpVerb.HTTP_GET);

// noinspection JSUnusedGlobalSymbols
export const POST = registerRoute(HttpVerb.HTTP_POST);

// noinspection JSUnusedGlobalSymbols
export const PUT = registerRoute(HttpVerb.HTTP_PUT);

// noinspection JSUnusedGlobalSymbols
export const PATCH = registerRoute(HttpVerb.HTTP_PATCH);

// noinspection JSUnusedGlobalSymbols
export const DELETE = registerRoute(HttpVerb.HTTP_DELETE);

// noinspection JSUnusedGlobalSymbols
export const routePrefix = (routePrefix: string) => (Class): void => {
    const routeTable = Class.prototype.__routeTable__ as RouteTable;
    routeTable.prefix = routePrefix;
};

export const authorize = () => (proto: any, methodName: string): void => {
    proto.__routeTable__ = proto.__routeTable__ || emptyTable();
    const table = proto.__routeTable__ as RouteTable;
    table.authedRoutes.push(methodName);
};

const emptyTable = (): RouteTable => {
    return {prefix: "", configs: [], authedRoutes: []};
};
