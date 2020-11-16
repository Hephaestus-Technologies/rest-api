import QueryParams from "./query-params";
import {StatusCode} from "./status-code";
import IHttpResult from "./i-http-result";
import RouteTable from "./route-table";
import RouteConfig from "./route-config";
import {Request, Response} from "express";

// noinspection JSUnusedGlobalSymbols
export default class ApiController {

    public matches(url: string): boolean {
        const routeTable = this._routeTable();
        return routeTable.matches(url);
    }

    private _routeTable(): RouteTable {
        return Object.getPrototypeOf(this).routeTable;
    }

    public async route(request: Request, response: Response): Promise<void> {
        const routeTable = this._routeTable();
        const config = routeTable.configFor(request.url);
        const params = this._paramsFrom(request, config);
        const result = await this._execute(config.methodName, params);
        response.status(result.statusCode).send(result.body);
    }

    private _paramsFrom(request, config: RouteConfig): {url: any[], query: QueryParams} {
        const routeTable = this._routeTable();
        const url = routeTable.paramsFor(request.url, config);
        const query = new QueryParams(request.query);
        return {url, query};
    }

    private async _execute(methodName: string, params: {url: any[], query: QueryParams}): Promise<IHttpResult> {
        const result = await this[methodName](...params.url, params.query);
        return result.statusCode ? result : {statusCode: StatusCode.OK, body: result};
    }

}
