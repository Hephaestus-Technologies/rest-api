import IHttpResult from "./i-http-result";
import RouteTable from "./route-table";
import RouteConfig from "./route-config";
import {Request} from "express";
import {HttpVerb} from "./http-verb";
import QueryParams from "./query-params";
import {StatusCode} from "./status-code";
import Route, {RouteHandler} from "./route";
import {prefixRegexOf, routeRegexOf} from "./regex-helpers";

type GetUserId = (request: Request) => Promise<number>;
type UserId = [] | [number];

// noinspection JSUnusedGlobalSymbols
export default class ApiController {

    public constructor() {
        this._toRoute = this._toRoute.bind(this);
    }

    public prefix(): RegExp {
        const routeTable = this._routeTable();
        return prefixRegexOf(routeTable.prefix);
    }

    public registerRoute(routeConfig: RouteConfig, auth: boolean = false): void {
        const routeTable = this._routeTable();
        routeTable.configs.push(routeConfig);
        if (auth) routeTable.authedRoutes.push(routeConfig.methodName);
    }

    public routes(): Route[] {
        const routeTable = this._routeTable();
        return routeTable.configs.map(this._toRoute);
    }

    private _toRoute(config: RouteConfig): Route {
        const routeTable = this._routeTable();
        const regex = routeRegexOf(`${routeTable.prefix}/${config.route}`);
        return {
            verb: config.verb,
            regex,
            method: this._handlerFrom(config.methodName, config.verb, regex)
        };
    }

    private _handlerFrom(methodName: string, verb: HttpVerb, regex: RegExp): RouteHandler {
        return async (request, response, getUserId) => {
            const result = await this._execute(request, verb, regex, methodName, getUserId);
            if (result.statusCode === StatusCode.REDIRECT)
                response.redirect(result.body);
            else
                response.status(result.statusCode).send(result.body);
        };
    }

    private _execute(request: Request, verb: HttpVerb, regex: RegExp, methodName: string, userId: GetUserId): Promise<IHttpResult> {
        switch (verb) {
            case HttpVerb.HTTP_HEAD:
            case HttpVerb.HTTP_GET:
            case HttpVerb.HTTP_DELETE:
                return this._executeWithQuery(request, regex, methodName, userId);
            case HttpVerb.HTTP_POST:
            case HttpVerb.HTTP_PUT:
            case HttpVerb.HTTP_PATCH:
                return this._executeWithBody(request, regex, methodName, userId);
            default:
                throw new TypeError(`Unrecognized verb "${verb}"`);
        }
    }

    private async _executeWithQuery(request: Request, regex: RegExp, methodName: string, getUserId: GetUserId): Promise<IHttpResult> {
        const userId = this._userIdFor(request, methodName, getUserId);
        const urlParams = ApiController._paramsFor(request.url, regex);
        const queryParams = new QueryParams(request.query as any);
        const params = [...await userId, ...urlParams, queryParams];
        const result = this[methodName](...params);
        return ApiController._toIHttpResult(await result);
    }

    private async _executeWithBody(request: Request, regex: RegExp, methodName: string, getUserId: GetUserId): Promise<IHttpResult> {
        const userId = this._userIdFor(request, methodName, getUserId);
        const urlParams = ApiController._paramsFor(request.url, regex);
        const body = JSON.parse(request.body);
        const params = [...await userId, ...urlParams, body];
        const result = await this[methodName](...params)
        return ApiController._toIHttpResult(result);
    }

    private async _userIdFor(request: any, methodName: string, getUserId: GetUserId): Promise<UserId> {
        const routeTable = this._routeTable();
        const needsAuth = routeTable.authedRoutes.includes(methodName);
        if (!needsAuth) return [];
        return [await getUserId(request)];
    }

    private static _paramsFor(url: string, regex: RegExp): any[] {
        const groups = regex.exec(url).groups || {};
        return Object.entries(groups).map(ApiController._extractParam);
    }

    private static _extractParam([nameType, value]: [string, string]): any {
        const paramType = nameType.split("_").pop();
        switch (paramType) {
            case "boolean": return ApiController._toBoolean(value);
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

    private static _toIHttpResult(result: any): IHttpResult {
        return (
            result.statusCode ?
            result :
            {statusCode: StatusCode.OK, body: result}
        );
    }

    private _routeTable(): RouteTable {
        return Object.getPrototypeOf(this).__routeTable__;
    }
}
