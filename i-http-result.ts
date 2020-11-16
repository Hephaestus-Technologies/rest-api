import {StatusCode} from "./status-code";

export default interface IHttpResult {

    statusCode: StatusCode;

    body: any;

}
