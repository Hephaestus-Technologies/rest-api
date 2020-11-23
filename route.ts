import {HttpVerb} from "./http-verb";
import {Request, Response} from "express";

export type GetUserId = (request: Request) => Promise<number>;

export type RouteHandler = (request: Request, response: Response, getUserId: GetUserId) => Promise<void>;

export default interface Route {

    verb: HttpVerb;

    regex: RegExp;

    method: RouteHandler

}
