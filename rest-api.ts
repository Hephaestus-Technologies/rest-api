import ApiController from "./api-controller";
import {Request, RequestHandler, Response} from "express";
import NotFoundError from "./not-found-error";
import {StatusCode} from "./status-code";
import Route from "./route";
import {HttpVerb} from "./http-verb";

type RouteSet = {prefix: RegExp, routes: Route[]};

// noinspection JSUnusedGlobalSymbols
export default abstract class RestApi {

    private _controllers: ApiController[];

    public constructor() {
        this.userId = this.userId.bind(this);
    }

    protected apiPrefix(): string {
        return "";
    }

    // noinspection JSUnusedLocalSymbols
    protected userId(request: Request): Promise<number> {
        return Promise.resolve(-1);
    };

    protected abstract controllers(): ApiController[];

    public inject(): RequestHandler {
        this._controllers = this.controllers();
        const routes = this._routesFromControllers();
        return async (request: Request, response: Response, next: () => {}) => {
            try {
                if (!request.url.startsWith(this.apiPrefix())) return next();
                await this._handleRequest(routes, request, response);
            } catch (e) {
                if (e instanceof NotFoundError)
                    response.sendStatus(StatusCode.NOT_FOUND);
                else
                    RestApi._sendError(request, response, e);
            }
        };
    }

    private _routesFromControllers(): RouteSet[] {
        return this._controllers.map(RestApi._routesFromController);
    };

    private static _routesFromController(controller: ApiController): RouteSet {
        return {
            prefix: controller.prefix(),
            routes: controller.routes()
        };
    }

    private _handleRequest(routes: RouteSet[], request: Request, response: Response): Promise<void> {
        request.url = request.url.slice(this.apiPrefix().length);
        const routeSet = routes.find(r => r.prefix.test(request.url));
        if (!routeSet) throw new NotFoundError();
        const route = routeSet.routes.find(RestApi._matches(request));
        if (!route) throw new NotFoundError();
        return route.method(request, response, this.userId.bind(this));
    }

    private static _matches(request: Request): (Route) => boolean {
        return route => (
            route.regex.test(request.url) &&
            route.verb === RestApi._toVerb(request.method)
        );
    }

    private static _toVerb(method: string): HttpVerb {
        switch (method) {
            case "HEAD": return HttpVerb.HTTP_HEAD;
            case "GET": return HttpVerb.HTTP_GET;
            case "POST": return HttpVerb.HTTP_POST;
            case "PUT": return HttpVerb.HTTP_PUT;
            case "PATCH": return HttpVerb.HTTP_PATCH;
            case "DELETE": return HttpVerb.HTTP_DELETE;
        }
    }

    private static _sendError(req, res, e: Error): void {
        const status = StatusCode.INTERNAL_SERVER_ERROR;
        const body = (
            req.hostname === "localhost" ?
                e.stack.split('\n').map(l => l.trim()) :
                "Internal Server Error"
        );
        res.status(status).send(body);
    }

}
