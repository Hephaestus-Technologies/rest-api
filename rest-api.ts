import ApiController from "./api-controller";
import {Request, RequestHandler, Response} from "express";
import NotFoundError from "./not-found-error";
import {StatusCode} from "./status-code";

// noinspection JSUnusedGlobalSymbols
export default abstract class RestApi {

    private _apiPrefix: string;
    private _controllers: ApiController[];

    public constructor(apiPrefix: string = "") {
        this._apiPrefix = apiPrefix;
        this._controllers = this.controllers();
    }

    public abstract controllers(): ApiController[];

    public configureRouting(): RequestHandler {
        return async (request: Request, response: Response, next: () => {}) => {
            try {
                if (!request.url.startsWith(this._apiPrefix)) next();
                request.url = request.url.slice(this._apiPrefix.length);
                const controller = this._controllerFor(request.url);
                return await controller.route(request, response);
            } catch (e) {
                if (e instanceof NotFoundError)
                    response.sendStatus(StatusCode.NOT_FOUND);
                else
                    RestApi._sendError(request, response, e);
            }
        };
    }

    public _controllerFor(url: string): ApiController {
        const apiController = this._controllers.find(c => c.matches(url));
        if (!apiController) throw new NotFoundError();
        return apiController;
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
