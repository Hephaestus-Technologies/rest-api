import RouteConfig from "./route-config";

export default interface RouteTable {

    prefix: string;

    configs: RouteConfig[];

    authedRoutes: string[];

}
