import {HttpVerb} from "./http-verb";

export default interface RouteConfig {

    verb: HttpVerb;

    regex: RegExp;

    methodName: string

}
