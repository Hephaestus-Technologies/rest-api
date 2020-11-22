import ApiController from "./api-controller";
import {Request, RequestHandler, Response} from "express";
import NotFoundError from "./not-found-error";
import {StatusCode} from "./status-code";

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
    protected userId(request: Request): Promise<string> {
        return Promise.resolve("");
    };

    protected abstract controllers(): ApiController[];

    public configureRouting(): RequestHandler {
        this._controllers = this.controllers();
        return async (request: Request, response: Response, next: () => {}) => {
            try {
                if (!request.url.startsWith(this.apiPrefix())) return next();
                await this._handleRequest(request, response);
            } catch (e) {
                if (e instanceof NotFoundError)
                    response.sendStatus(StatusCode.NOT_FOUND);
                else
                    RestApi._sendError(request, response, e);
            }
        };
    }

    private _handleRequest(request: Request, response: Response): Promise<void> {
        request.url = request.url.slice(this.apiPrefix().length);
        const controller = this._controllerFor(request.url);
        return controller.route(request, response, this.userId);
    }

    private _controllerFor(url: string): ApiController {
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
