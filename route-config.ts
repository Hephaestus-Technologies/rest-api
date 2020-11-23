import {HttpVerb} from "./http-verb";

export default interface RouteConfig {

    verb: HttpVerb;

    route: string;

    methodName: string

}
