import IHttpResult from "./i-http-result";
import {StatusCode} from "./status-code";

// noinspection JSUnusedGlobalSymbols
export const Ok = (body = null): IHttpResult => {
    return {
        statusCode: StatusCode.OK,
        body
    };
};

// noinspection JSUnusedGlobalSymbols
export const NotFound = (): IHttpResult => {
    return {
        statusCode: StatusCode.NOT_FOUND,
        body: "Not Found"
    };
};

// noinspection JSUnusedGlobalSymbols
export const InternalServerError = (): IHttpResult => {
    return {
        statusCode: StatusCode.INTERNAL_SERVER_ERROR,
        body: "Internal Server Error"
    };
};

// noinspection JSUnusedGlobalSymbols
export const BadRequest = (): IHttpResult => {
    return {
        statusCode: StatusCode.BAD_REQUEST,
        body: "Bad Request"
    };
};

// noinspection JSUnusedGlobalSymbols
export const Redirect = (location: string): IHttpResult => {
    return {
        statusCode: StatusCode.REDIRECT,
        body: location
    };
};
