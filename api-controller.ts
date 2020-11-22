import IHttpResult from "./i-http-result";
import RouteTable from "./route-table";
import RouteConfig from "./route-config";
import {Request, Response} from "express";
import {HttpVerb} from "./http-verb";
import QueryParams from "./query-params";
import {StatusCode} from "./status-code";
import NotFoundError from "./not-found-error";

// noinspection JSUnusedGlobalSymbols
export default class ApiController {

    public matches(url: string): boolean {
        const routeTable = this.routeTable();
        return routeTable.matches(url);
    }

    public routeTable(): RouteTable {
        return Object.getPrototypeOf(this).__routeTable__;
    }

    public async route(request: Request, response: Response): Promise<void> {
        const routeTable = this.routeTable();
        const config = routeTable.configFor(request.url);
        if (!config) throw new NotFoundError();
        const result = await this._execute(request, config);
        response.status(result.statusCode).send(result.body);
    }

    private _execute(request: Request, config: RouteConfig): Promise<IHttpResult> {
        switch (config.verb) {
            case HttpVerb.HTTP_HEAD:
            case HttpVerb.HTTP_GET:
            case HttpVerb.HTTP_DELETE:
                return this._executeWithQuery(request, config);
            case HttpVerb.HTTP_POST:
            case HttpVerb.HTTP_PUT:
            case HttpVerb.HTTP_PATCH:
                return this._executeWithBody(request, config);
            default:
                throw new TypeError(`Unrecognized verb "${config.verb}"`);
        }
    }

    private async _executeWithQuery(request: Request, config: RouteConfig): Promise<IHttpResult> {
        const urlParams = this._paramsFrom(request.url, config);
        const queryParams = new QueryParams(request.query as any);
        const result = await this[config.methodName](...urlParams, queryParams);
        return ApiController._toIHttpResult(result);
    }

    private async _executeWithBody(request: Request, config: RouteConfig): Promise<IHttpResult> {
        const urlParams = this._paramsFrom(request.url, config);
        const body = JSON.parse(request.body);
        const result = await this[config.methodName](...urlParams, body)
        return ApiController._toIHttpResult(result);
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
