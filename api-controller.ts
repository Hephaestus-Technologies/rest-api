import IHttpResult from "./i-http-result";
import RouteTable from "./route-table";
import RouteConfig from "./route-config";
import {Request, Response} from "express";
import {HttpVerb} from "./http-verb";
import QueryParams from "./query-params";
import {StatusCode} from "./status-code";
import NotFoundError from "./not-found-error";

type GetUserId = (request: Request) => Promise<string>;
type UserId = [] | [string];

// noinspection JSUnusedGlobalSymbols
export default class ApiController {

    public matches(url: string): boolean {
        const routeTable = this.routeTable();
        return routeTable.matches(url);
    }

    public routeTable(): RouteTable {
        return Object.getPrototypeOf(this).__routeTable__;
    }

    public async route(request: Request, response: Response, getUserId: GetUserId): Promise<void> {
        const routeTable = this.routeTable();
        const config = routeTable.configFor(request.url);
        if (!config) throw new NotFoundError();
        const result = await this._execute(request, config, getUserId);
        if (result.statusCode === StatusCode.REDIRECT)
            response.redirect(result.body);
        else
            response.status(result.statusCode).send(result.body);
    }

    private _execute(request: Request, config: RouteConfig, getUserId: GetUserId): Promise<IHttpResult> {
        switch (config.verb) {
            case HttpVerb.HTTP_HEAD:
            case HttpVerb.HTTP_GET:
            case HttpVerb.HTTP_DELETE:
                return this._executeWithQuery(request, config, getUserId);
            case HttpVerb.HTTP_POST:
            case HttpVerb.HTTP_PUT:
            case HttpVerb.HTTP_PATCH:
                return this._executeWithBody(request, config, getUserId);
            default:
                throw new TypeError(`Unrecognized verb "${config.verb}"`);
        }
    }

    private async _executeWithQuery(request: Request, config: RouteConfig, getUserId: GetUserId): Promise<IHttpResult> {
        const userId = this._userIdFor(request, config.methodName, getUserId);
        const urlParams = this._paramsFrom(request.url, config);
        const queryParams = new QueryParams(request.query as any);
        const params = [...await userId, ...urlParams, queryParams];
        const result = this[config.methodName](...params);
        return ApiController._toIHttpResult(await result);
    }

    private async _executeWithBody(request: Request, config: RouteConfig, getUserId: GetUserId): Promise<IHttpResult> {
        const userId = this._userIdFor(request, config.methodName, getUserId);
        const urlParams = this._paramsFrom(request.url, config);
        const body = JSON.parse(request.body);
        const params = [...await userId, ...urlParams, body];
        const result = await this[config.methodName](...params)
        return ApiController._toIHttpResult(result);
    }

    private async _userIdFor(request: any, methodName: string, getUserId: GetUserId): Promise<UserId> {
        const routeTable = this.routeTable();
        const needsAuth = routeTable.needsAuth(methodName);
        if (!needsAuth) return [];
        return [await getUserId(request)];
    }

    private _paramsFrom(url: string, config: RouteConfig): any[] {
        const routeTable = this.routeTable();
        return routeTable.paramsFor(url, config);
    }

    private static _toIHttpResult(result: any): IHttpResult {
        return (
            result.statusCode ?
            result :
            {statusCode: StatusCode.OK, body: result}
        );
    }
}
